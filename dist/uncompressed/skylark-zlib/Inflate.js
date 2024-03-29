define([
  "./zlib",
  "./adler32",
  "./RawInflate"
],function(
  Zlib,
  Adler32,
  RawInflate
) {
  /**
   * @constructor
   * @param {!(Uint8Array|Array)} input deflated buffer.
   * @param {Object=} opt_params option parameters.
   *
   * opt_params は以下のプロパティを指定する事ができます。
   *   - index: input buffer の deflate コンテナの開始位置.
   *   - blockSize: バッファのブロックサイズ.
   *   - verify: 伸張が終わった後 adler-32 checksum の検証を行うか.
   *   - bufferType: Inflate.BufferType の値によってバッファの管理方法を指定する.
   *       Inflate.BufferType は RawInflate.BufferType のエイリアス.
   */
  var Inflate = function(input, opt_params) {
    /** @type {number} */
    var bufferSize;
    /** @type {Inflate.BufferType} */
    var bufferType;
    /** @type {number} */
    var cmf;
    /** @type {number} */
    var flg;

    /** @type {!(Uint8Array|Array)} */
    this.input = input;
    /** @type {number} */
    this.ip = 0;
    /** @type {RawInflate} */
    this.rawinflate;
    /** @type {(boolean|undefined)} verify flag. */
    this.verify;

    // option parameters
    if (opt_params || !(opt_params = {})) {
      if (opt_params['index']) {
        this.ip = opt_params['index'];
      }
      if (opt_params['verify']) {
        this.verify = opt_params['verify'];
      }
    }

    // Compression Method and Flags
    cmf = input[this.ip++];
    flg = input[this.ip++];

    // compression method
    switch (cmf & 0x0f) {
      case Zlib.CompressionMethod.DEFLATE:
        this.method = Zlib.CompressionMethod.DEFLATE;
        break;
      default:
        throw new Error('unsupported compression method');
    }

    // fcheck
    if (((cmf << 8) + flg) % 31 !== 0) {
      throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
    }

    // fdict (not supported)
    if (flg & 0x20) {
      throw new Error('fdict flag is not supported');
    }

    // RawInflate
    this.rawinflate = new RawInflate(input, {
      'index': this.ip,
      'bufferSize': opt_params['bufferSize'],
      'bufferType': opt_params['bufferType'],
      'resize': opt_params['resize']
    });
  }

  /**
   * @enum {number}
   */
  Inflate.BufferType = RawInflate.BufferType;

  /**
   * decompress.
   * @return {!(Uint8Array|Array)} inflated buffer.
   */
  Inflate.prototype.decompress = function() {
    /** @type {!(Array|Uint8Array)} input buffer. */
    var input = this.input;
    /** @type {!(Uint8Array|Array)} inflated buffer. */
    var buffer;
    /** @type {number} adler-32 checksum */
    var adler32;

    buffer = this.rawinflate.decompress();
    this.ip = this.rawinflate.ip;

    // verify adler-32
    if (this.verify) {
      adler32 = (
        input[this.ip++] << 24 | input[this.ip++] << 16 |
        input[this.ip++] << 8 | input[this.ip++]
      ) >>> 0;

      if (adler32 !== Adler32(buffer)) {
        throw new Error('invalid adler-32 checksum');
      }
    }

    return buffer;
  };

  return Zlib.Inflate = Inflate;
});
