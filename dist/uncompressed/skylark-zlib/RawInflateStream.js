define([
  "./zlib",
  "./huffman"
],function(Zlib,Huffman) {
  const USE_TYPEDARRAY = true;

  //-----------------------------------------------------------------------------

  /** @define {number} buffer block size. */
  var ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE = 0x8000;

  //-----------------------------------------------------------------------------

  var buildHuffmanTable = Huffman.buildHuffmanTable;

  /**
   * @param {!(Uint8Array|Array.<number>)} input input buffer.
   * @param {number} ip input buffer pointer.
   * @param {number=} opt_buffersize buffer block size.
   * @constructor
   */
  var RawInflateStream = function(input, ip, opt_buffersize) {
    /** @type {!Array.<(Array|Uint8Array)>} */
    this.blocks = [];
    /** @type {number} block size. */
    this.bufferSize =
      opt_buffersize ? opt_buffersize : ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE;
    /** @type {!number} total output buffer pointer. */
    this.totalpos = 0;
    /** @type {!number} input buffer pointer. */
    this.ip = ip === void 0 ? 0 : ip;
    /** @type {!number} bit stream reader buffer. */
    this.bitsbuf = 0;
    /** @type {!number} bit stream reader buffer size. */
    this.bitsbuflen = 0;
    /** @type {!(Array|Uint8Array)} input buffer. */
    this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;
    /** @type {!(Uint8Array|Array)} output buffer. */
    this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.bufferSize);
    /** @type {!number} output buffer pointer. */
    this.op = 0;
    /** @type {boolean} is final block flag. */
    this.bfinal = false;
    /** @type {number} uncompressed block length. */
    this.blockLength;
    /** @type {boolean} resize flag for memory size optimization. */
    this.resize = false;
    /** @type {Array} */
    this.litlenTable;
    /** @type {Array} */
    this.distTable;
    /** @type {number} */
    this.sp = 0; // stream pointer
    /** @type {RawInflateStream.Status} */
    this.status = RawInflateStream.Status.INITIALIZED;

    //
    // backup
    //
    /** @type {!number} */
    this.ip_;
    /** @type {!number} */
    this.bitsbuflen_;
    /** @type {!number} */
    this.bitsbuf_;
  };

  /**
   * @enum {number}
   */
  RawInflateStream.BlockType = {
    UNCOMPRESSED: 0,
    FIXED: 1,
    DYNAMIC: 2
  };

  /**
   * @enum {number}
   */
  RawInflateStream.Status = {
    INITIALIZED: 0,
    BLOCK_HEADER_START: 1,
    BLOCK_HEADER_END: 2,
    BLOCK_BODY_START: 3,
    BLOCK_BODY_END: 4,
    DECODE_BLOCK_START: 5,
    DECODE_BLOCK_END: 6
  };

  /**
   * decompress.
   * @return {!(Uint8Array|Array)} inflated buffer.
   */
  RawInflateStream.prototype.decompress = function(newInput, ip) {
    /** @type {boolean} */
    var stop = false;

    if (newInput !== void 0) {
      this.input = newInput;
    }

    if (ip !== void 0) {
      this.ip = ip;
    }

    // decompress
    while (!stop) {
      switch (this.status) {
        // block header
        case RawInflateStream.Status.INITIALIZED:
        case RawInflateStream.Status.BLOCK_HEADER_START:
          if (this.readBlockHeader() < 0) {
            stop = true;
          }
          break;
        // block body
        case RawInflateStream.Status.BLOCK_HEADER_END: /* FALLTHROUGH */
        case RawInflateStream.Status.BLOCK_BODY_START:
          switch(this.currentBlockType) {
            case RawInflateStream.BlockType.UNCOMPRESSED:
              if (this.readUncompressedBlockHeader() < 0) {
                stop = true;
              }
              break;
            case RawInflateStream.BlockType.FIXED:
              if (this.parseFixedHuffmanBlock() < 0) {
                stop = true;
              }
              break;
            case RawInflateStream.BlockType.DYNAMIC:
              if (this.parseDynamicHuffmanBlock() < 0) {
                stop = true;
              }
              break;
          }
          break;
        // decode data
        case RawInflateStream.Status.BLOCK_BODY_END:
        case RawInflateStream.Status.DECODE_BLOCK_START:
          switch(this.currentBlockType) {
            case RawInflateStream.BlockType.UNCOMPRESSED:
              if (this.parseUncompressedBlock() < 0) {
                stop = true;
              }
              break;
            case RawInflateStream.BlockType.FIXED: /* FALLTHROUGH */
            case RawInflateStream.BlockType.DYNAMIC:
              if (this.decodeHuffman() < 0) {
                stop = true;
              }
              break;
          }
          break;
        case RawInflateStream.Status.DECODE_BLOCK_END:
          if (this.bfinal) {
            stop = true;
          } else {
            this.status = RawInflateStream.Status.INITIALIZED;
          }
          break;
      }
    }

    return this.concatBuffer();
  };

  /**
   * @const
   * @type {number} max backward length for LZ77.
   */
  RawInflateStream.MaxBackwardLength = 32768;

  /**
   * @const
   * @type {number} max copy length for LZ77.
   */
  RawInflateStream.MaxCopyLength = 258;

  /**
   * huffman order
   * @const
   * @type {!(Array.<number>|Uint8Array)}
   */
  RawInflateStream.Order = (function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table;
  })([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);

  /**
   * huffman length code table.
   * @const
   * @type {!(Array.<number>|Uint16Array)}
   */
  RawInflateStream.LengthCodeTable = (function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table;
  })([
    0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b,
    0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b,
    0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3,
    0x00e3, 0x0102, 0x0102, 0x0102
  ]);

  /**
   * huffman length extra-bits table.
   * @const
   * @type {!(Array.<number>|Uint8Array)}
   */
  RawInflateStream.LengthExtraTable = (function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table;
  })([
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5,
    5, 5, 0, 0, 0
  ]);

  /**
   * huffman dist code table.
   * @const
   * @type {!(Array.<number>|Uint16Array)}
   */
  RawInflateStream.DistCodeTable = (function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table;
  })([
    0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011,
    0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181,
    0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001,
    0x3001, 0x4001, 0x6001
  ]);

  /**
   * huffman dist extra-bits table.
   * @const
   * @type {!(Array.<number>|Uint8Array)}
   */
  RawInflateStream.DistExtraTable = (function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table;
  })([
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
    11, 12, 12, 13, 13
  ]);

  /**
   * fixed huffman length code table
   * @const
   * @type {!Array}
   */
  RawInflateStream.FixedLiteralLengthTable = (function(table) {
    return table;
  })((function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(288);
    var i, il;

    for (i = 0, il = lengths.length; i < il; ++i) {
      lengths[i] =
        (i <= 143) ? 8 :
        (i <= 255) ? 9 :
        (i <= 279) ? 7 :
        8;
    }

    return buildHuffmanTable(lengths);
  })());

  /**
   * fixed huffman distance code table
   * @const
   * @type {!Array}
   */
  RawInflateStream.FixedDistanceTable = (function(table) {
    return table;
  })((function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(30);
    var i, il;

    for (i = 0, il = lengths.length; i < il; ++i) {
      lengths[i] = 5;
    }

    return buildHuffmanTable(lengths);
  })());

  /**
   * parse deflated block.
   */
  RawInflateStream.prototype.readBlockHeader = function() {
    /** @type {number} header */
    var hdr;

    this.status = RawInflateStream.Status.BLOCK_HEADER_START;

    this.save_();
    if ((hdr = this.readBits(3)) < 0) {
      this.restore_();
      return -1;
    }

    // BFINAL
    if (hdr & 0x1) {
      this.bfinal = true;
    }

    // BTYPE
    hdr >>>= 1;
    switch (hdr) {
      case 0: // uncompressed
        this.currentBlockType = RawInflateStream.BlockType.UNCOMPRESSED;
        break;
      case 1: // fixed huffman
        this.currentBlockType = RawInflateStream.BlockType.FIXED;
        break;
      case 2: // dynamic huffman
        this.currentBlockType = RawInflateStream.BlockType.DYNAMIC;
        break;
      default: // reserved or other
        throw new Error('unknown BTYPE: ' + hdr);
    }

    this.status = RawInflateStream.Status.BLOCK_HEADER_END;
  };

  /**
   * read inflate bits
   * @param {number} length bits length.
   * @return {number} read bits.
   */
  RawInflateStream.prototype.readBits = function(length) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;

    /** @type {number} input and output byte. */
    var octet;

    // not enough buffer
    while (bitsbuflen < length) {
      // input byte
      if (input.length <= ip) {
        return -1;
      }
      octet = input[ip++];

      // concat octet
      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8;
    }

    // output byte
    octet = bitsbuf & /* MASK */ ((1 << length) - 1);
    bitsbuf >>>= length;
    bitsbuflen -= length;

    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;

    return octet;
  };

  /**
   * read huffman code using table
   * @param {Array} table huffman code table.
   * @return {number} huffman code.
   */
  RawInflateStream.prototype.readCodeByTable = function(table) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;

    /** @type {!(Array|Uint8Array)} huffman code table */
    var codeTable = table[0];
    /** @type {number} */
    var maxCodeLength = table[1];
    /** @type {number} input byte */
    var octet;
    /** @type {number} code length & code (16bit, 16bit) */
    var codeWithLength;
    /** @type {number} code bits length */
    var codeLength;

    // not enough buffer
    while (bitsbuflen < maxCodeLength) {
      if (input.length <= ip) {
        return -1;
      }
      octet = input[ip++];
      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8;
    }

    // read max length
    codeWithLength = codeTable[bitsbuf & ((1 << maxCodeLength) - 1)];
    codeLength = codeWithLength >>> 16;

    if (codeLength > bitsbuflen) {
      throw new Error('invalid code length: ' + codeLength);
    }

    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;

    return codeWithLength & 0xffff;
  };

  /**
   * read uncompressed block header
   */
  RawInflateStream.prototype.readUncompressedBlockHeader = function() {
    /** @type {number} block length */
    var len;
    /** @type {number} number for check block length */
    var nlen;

    var input = this.input;
    var ip = this.ip;

    this.status = RawInflateStream.Status.BLOCK_BODY_START;

    if (ip + 4 >= input.length) {
      return -1;
    }

    len = input[ip++] | (input[ip++] << 8);
    nlen = input[ip++] | (input[ip++] << 8);

    // check len & nlen
    if (len === ~nlen) {
      throw new Error('invalid uncompressed block header: length verify');
    }

    // skip buffered header bits
    this.bitsbuf = 0;
    this.bitsbuflen = 0;

    this.ip = ip;
    this.blockLength = len;
    this.status = RawInflateStream.Status.BLOCK_BODY_END;
  };

  /**
   * parse uncompressed block.
   */
  RawInflateStream.prototype.parseUncompressedBlock = function() {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;
    var len = this.blockLength;

    this.status = RawInflateStream.Status.DECODE_BLOCK_START;

    // copy
    // XXX: とりあえず素直にコピー
    while (len--) {
      if (op === output.length) {
        output = this.expandBuffer({fixRatio: 2});
      }

      // not enough input buffer
      if (ip >= input.length) {
        this.ip = ip;
        this.op = op;
        this.blockLength = len + 1; // コピーしてないので戻す
        return -1;
      }

      output[op++] = input[ip++];
    }

    if (len < 0) {
      this.status = RawInflateStream.Status.DECODE_BLOCK_END;
    }

    this.ip = ip;
    this.op = op;

    return 0;
  };

  /**
   * parse fixed huffman block.
   */
  RawInflateStream.prototype.parseFixedHuffmanBlock = function() {
    this.status = RawInflateStream.Status.BLOCK_BODY_START;

    this.litlenTable = RawInflateStream.FixedLiteralLengthTable;
    this.distTable = RawInflateStream.FixedDistanceTable;

    this.status = RawInflateStream.Status.BLOCK_BODY_END;

    return 0;
  };

  /**
   * オブジェクトのコンテキストを別のプロパティに退避する.
   * @private
   */
  RawInflateStream.prototype.save_ = function() {
    this.ip_ = this.ip;
    this.bitsbuflen_ = this.bitsbuflen;
    this.bitsbuf_ = this.bitsbuf;
  };

  /**
   * 別のプロパティに退避したコンテキストを復元する.
   * @private
   */
  RawInflateStream.prototype.restore_ = function() {
    this.ip = this.ip_;
    this.bitsbuflen = this.bitsbuflen_;
    this.bitsbuf = this.bitsbuf_;
  };

  /**
   * parse dynamic huffman block.
   */
  RawInflateStream.prototype.parseDynamicHuffmanBlock = function() {
    /** @type {number} number of literal and length codes. */
    var hlit;
    /** @type {number} number of distance codes. */
    var hdist;
    /** @type {number} number of code lengths. */
    var hclen;
    /** @type {!(Uint8Array|Array)} code lengths. */
    var codeLengths =
      new (USE_TYPEDARRAY ? Uint8Array : Array)(RawInflateStream.Order.length);
    /** @type {!Array} code lengths table. */
    var codeLengthsTable;
    /** @type {!(Uint32Array|Array)} literal and length code lengths. */
    var litlenLengths;
    /** @type {!(Uint32Array|Array)} distance code lengths. */
    var distLengths;

    this.status = RawInflateStream.Status.BLOCK_BODY_START;

    this.save_();
    hlit = this.readBits(5) + 257;
    hdist = this.readBits(5) + 1;
    hclen = this.readBits(4) + 4;
    if (hlit < 0 || hdist < 0 || hclen < 0) {
      this.restore_();
      return -1;
    }

    try {
      parseDynamicHuffmanBlockImpl.call(this);
    } catch(e) {
      this.restore_();
      return -1;
    }

    function parseDynamicHuffmanBlockImpl() {
      /** @type {number} */
      var bits;
      var code;
      var prev = 0;
      var repeat;
      /** @type {!(Uint8Array|Array.<number>)} code length table. */
      var lengthTable;
      /** @type {number} loop counter. */
      var i;
      /** @type {number} loop limit. */
      var il;

      // decode code lengths
      for (i = 0; i < hclen; ++i) {
        if ((bits = this.readBits(3)) < 0) {
          throw new Error('not enough input');
        }
        codeLengths[RawInflateStream.Order[i]] = bits;
      }

      // decode length table
      codeLengthsTable = buildHuffmanTable(codeLengths);
      lengthTable = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit + hdist);
      for (i = 0, il = hlit + hdist; i < il;) {
        code = this.readCodeByTable(codeLengthsTable);
        if (code < 0) {
          throw new Error('not enough input');
        }
        switch (code) {
          case 16:
            if ((bits = this.readBits(2)) < 0) {
              throw new Error('not enough input');
            }
            repeat = 3 + bits;
            while (repeat--) { lengthTable[i++] = prev; }
            break;
          case 17:
            if ((bits = this.readBits(3)) < 0) {
              throw new Error('not enough input');
            }
            repeat = 3 + bits;
            while (repeat--) { lengthTable[i++] = 0; }
            prev = 0;
            break;
          case 18:
            if ((bits = this.readBits(7)) < 0) {
              throw new Error('not enough input');
            }
            repeat = 11 + bits;
            while (repeat--) { lengthTable[i++] = 0; }
            prev = 0;
            break;
          default:
            lengthTable[i++] = code;
            prev = code;
            break;
        }
      }

      // literal and length code
      litlenLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit);

      // distance code
      distLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hdist);

      this.litlenTable = USE_TYPEDARRAY
        ? buildHuffmanTable(lengthTable.subarray(0, hlit))
        : buildHuffmanTable(lengthTable.slice(0, hlit));
      this.distTable = USE_TYPEDARRAY
        ? buildHuffmanTable(lengthTable.subarray(hlit))
        : buildHuffmanTable(lengthTable.slice(hlit));
    }

    this.status = RawInflateStream.Status.BLOCK_BODY_END;

    return 0;
  };

  /**
   * decode huffman code (dynamic)
   * @return {(number|undefined)} -1 is error.
   */
  RawInflateStream.prototype.decodeHuffman = function() {
    var output = this.output;
    var op = this.op;

    /** @type {number} huffman code. */
    var code;
    /** @type {number} table index. */
    var ti;
    /** @type {number} huffman code distination. */
    var codeDist;
    /** @type {number} huffman code length. */
    var codeLength;

    var litlen = this.litlenTable;
    var dist = this.distTable;

    var olength = output.length;
    var bits;

    this.status = RawInflateStream.Status.DECODE_BLOCK_START;

    while (true) {
      this.save_();

      code = this.readCodeByTable(litlen);
      if (code < 0) {
        this.op = op;
        this.restore_();
        return -1;
      }

      if (code === 256) {
        break;
      }

      // literal
      if (code < 256) {
        if (op === olength) {
          output = this.expandBuffer();
          olength = output.length;
        }
        output[op++] = code;

        continue;
      }

      // length code
      ti = code - 257;
      codeLength = RawInflateStream.LengthCodeTable[ti];
      if (RawInflateStream.LengthExtraTable[ti] > 0) {
        bits = this.readBits(RawInflateStream.LengthExtraTable[ti]);
        if (bits < 0) {
          this.op = op;
          this.restore_();
          return -1;
        }
        codeLength += bits;
      }

      // dist code
      code = this.readCodeByTable(dist);
      if (code < 0) {
        this.op = op;
        this.restore_();
        return -1;
      }
      codeDist = RawInflateStream.DistCodeTable[code];
      if (RawInflateStream.DistExtraTable[code] > 0) {
        bits = this.readBits(RawInflateStream.DistExtraTable[code]);
        if (bits < 0) {
          this.op = op;
          this.restore_();
          return -1;
        }
        codeDist += bits;
      }

      // lz77 decode
      if (op + codeLength >= olength) {
        output = this.expandBuffer();
        olength = output.length;
      }

      while (codeLength--) {
        output[op] = output[(op++) - codeDist];
      }

      // break
      if (this.ip === this.input.length) {
        this.op = op;
        return -1;
      }
    }

    while (this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--;
    }

    this.op = op;
    this.status = RawInflateStream.Status.DECODE_BLOCK_END;
  };

  /**
   * expand output buffer. (dynamic)
   * @param {Object=} opt_param option parameters.
   * @return {!(Array|Uint8Array)} output buffer pointer.
   */
  RawInflateStream.prototype.expandBuffer = function(opt_param) {
    /** @type {!(Array|Uint8Array)} store buffer. */
    var buffer;
    /** @type {number} expantion ratio. */
    var ratio = (this.input.length / this.ip + 1) | 0;
    /** @type {number} maximum number of huffman code. */
    var maxHuffCode;
    /** @type {number} new output buffer size. */
    var newSize;
    /** @type {number} max inflate size. */
    var maxInflateSize;

    var input = this.input;
    var output = this.output;

    if (opt_param) {
      if (typeof opt_param.fixRatio === 'number') {
        ratio = opt_param.fixRatio;
      }
      if (typeof opt_param.addRatio === 'number') {
        ratio += opt_param.addRatio;
      }
    }

    // calculate new buffer size
    if (ratio < 2) {
      maxHuffCode =
        (input.length - this.ip) / this.litlenTable[2];
      maxInflateSize = (maxHuffCode / 2 * 258) | 0;
      newSize = maxInflateSize < output.length ?
        output.length + maxInflateSize :
        output.length << 1;
    } else {
      newSize = output.length * ratio;
    }

    // buffer expantion
    if (USE_TYPEDARRAY) {
      buffer = new Uint8Array(newSize);
      buffer.set(output);
    } else {
      buffer = output;
    }

    this.output = buffer;

    return this.output;
  };

  /**
   * concat output buffer. (dynamic)
   * @return {!(Array|Uint8Array)} output buffer.
   */
  RawInflateStream.prototype.concatBuffer = function() {
    /** @type {!(Array|Uint8Array)} output buffer. */
    var buffer;
    /** @type {number} */
    var op = this.op;
    /** @type {Uint8Array} */
    var tmp;

    if (this.resize) {
      if (USE_TYPEDARRAY) {
        buffer = new Uint8Array(this.output.subarray(this.sp, op));
      } else {
        buffer = this.output.slice(this.sp, op);
      }
    } else {
      buffer =
        USE_TYPEDARRAY ? this.output.subarray(this.sp, op) : this.output.slice(this.sp, op);
    }

    this.sp = op;

    // compaction
    if (op > RawInflateStream.MaxBackwardLength + this.bufferSize) {
      this.op = this.sp = RawInflateStream.MaxBackwardLength;
      if (USE_TYPEDARRAY) {
        tmp = /** @type {Uint8Array} */(this.output);
        this.output = new Uint8Array(this.bufferSize + RawInflateStream.MaxBackwardLength);
        this.output.set(tmp.subarray(op - RawInflateStream.MaxBackwardLength, op));
      } else {
        this.output = this.output.slice(op - RawInflateStream.MaxBackwardLength);
      }
    }

    return buffer;
  };

  return Zlib.RawInflateStream = RawInflateStream;
  
});


