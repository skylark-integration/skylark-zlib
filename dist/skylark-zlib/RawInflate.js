/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib"],function(t){var e,i=Huffman.buildHuffmanTable,r=function(t,e){switch(this.buffer,this.blocks=[],this.bufferSize=32768,this.totalpos=0,this.ip=0,this.bitsbuf=0,this.bitsbuflen=0,this.input=new Uint8Array(t),this.output,this.op,this.bfinal=!1,this.bufferType=r.BufferType.ADAPTIVE,this.resize=!1,!e&&(e={})||(e.index&&(this.ip=e.index),e.bufferSize&&(this.bufferSize=e.bufferSize),e.bufferType&&(this.bufferType=e.bufferType),e.resize&&(this.resize=e.resize)),this.bufferType){case r.BufferType.BLOCK:this.op=r.MaxBackwardLength,this.output=new Uint8Array(r.MaxBackwardLength+this.bufferSize+r.MaxCopyLength);break;case r.BufferType.ADAPTIVE:this.op=0,this.output=new Uint8Array(this.bufferSize),this.expandBuffer=this.expandBufferAdaptive,this.concatBuffer=this.concatBufferDynamic,this.decodeHuffman=this.decodeHuffmanAdaptive;break;default:throw new Error("invalid inflate mode")}};return r.BufferType={BLOCK:0,ADAPTIVE:1},r.prototype.decompress=function(){for(;!this.bfinal;)this.parseBlock();return this.concatBuffer()},r.MaxBackwardLength=32768,r.MaxCopyLength=258,r.Order=(e=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],new Uint16Array(e)),r.LengthCodeTable=function(t){return new Uint16Array(t)}([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258]),r.LengthExtraTable=function(t){return new Uint8Array(t)}([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0]),r.DistCodeTable=function(t){return new Uint16Array(t)}([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577]),r.DistExtraTable=function(t){return new Uint8Array(t)}([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),r.FixedLiteralLengthTable=function(){var t,e,r=new Uint8Array(288);for(t=0,e=r.length;t<e;++t)r[t]=t<=143?8:t<=255?9:t<=279?7:8;return i(r)}(),r.FixedDistanceTable=function(){var t,e,r=new Uint8Array(30);for(t=0,e=r.length;t<e;++t)r[t]=5;return i(r)}(),r.prototype.parseBlock=function(){var t=this.readBits(3);switch(1&t&&(this.bfinal=!0),t>>>=1){case 0:this.parseUncompressedBlock();break;case 1:this.parseFixedHuffmanBlock();break;case 2:this.parseDynamicHuffmanBlock();break;default:throw new Error("unknown BTYPE: "+t)}},r.prototype.readBits=function(t){for(var e,i=this.bitsbuf,r=this.bitsbuflen,a=this.input,s=this.ip,n=a.length;r<t;){if(s>=n)throw new Error("input buffer is broken");i|=a[s++]<<r,r+=8}return e=i&(1<<t)-1,i>>>=t,r-=t,this.bitsbuf=i,this.bitsbuflen=r,this.ip=s,e},r.prototype.readCodeByTable=function(t){for(var e,i,r=this.bitsbuf,a=this.bitsbuflen,s=this.input,n=this.ip,h=s.length,o=t[0],f=t[1];a<f&&!(n>=h);)r|=s[n++]<<a,a+=8;if((i=(e=o[r&(1<<f)-1])>>>16)>a)throw new Error("invalid code length: "+i);return this.bitsbuf=r>>i,this.bitsbuflen=a-i,this.ip=n,65535&e},r.prototype.parseUncompressedBlock=function(){var t,e,i=this.input,a=this.ip,s=this.output,n=this.op,h=i.length,o=s.length;if(this.bitsbuf=0,this.bitsbuflen=0,a+1>=h)throw new Error("invalid uncompressed block header: LEN");if(t=i[a++]|i[a++]<<8,a+1>=h)throw new Error("invalid uncompressed block header: NLEN");if(t===~(i[a++]|i[a++]<<8))throw new Error("invalid uncompressed block header: length verify");if(a+t>i.length)throw new Error("input buffer is broken");switch(this.bufferType){case r.BufferType.BLOCK:for(;n+t>s.length;)t-=e=o-n,s.set(i.subarray(a,a+e),n),n+=e,a+=e,this.op=n,s=this.expandBuffer(),n=this.op;break;case r.BufferType.ADAPTIVE:for(;n+t>s.length;)s=this.expandBuffer({fixRatio:2});break;default:throw new Error("invalid inflate mode")}s.set(i.subarray(a,a+t),n),n+=t,a+=t,this.ip=a,this.op=n,this.output=s},r.prototype.parseFixedHuffmanBlock=function(){this.decodeHuffman(r.FixedLiteralLengthTable,r.FixedDistanceTable)},r.prototype.parseDynamicHuffmanBlock=function(){var t,e,a,s,n,h,o,f,u,p=this.readBits(5)+257,b=this.readBits(5)+1,l=this.readBits(4)+4,d=new Uint8Array(r.Order.length);for(f=0;f<l;++f)d[r.Order[f]]=this.readBits(3);for(t=i(d),s=new Uint8Array(p+b),f=0,u=p+b;f<u;)switch(n=this.readCodeByTable(t)){case 16:for(o=3+this.readBits(2);o--;)s[f++]=h;break;case 17:for(o=3+this.readBits(3);o--;)s[f++]=0;h=0;break;case 18:for(o=11+this.readBits(7);o--;)s[f++]=0;h=0;break;default:s[f++]=n,h=n}e=i(s.subarray(0,p)),a=i(s.subarray(p)),this.decodeHuffman(e,a)},r.prototype.decodeHuffman=function(t,e){var i=this.output,a=this.op;this.currentLitlenTable=t;for(var s,n,h,o,f=i.length-r.MaxCopyLength;256!==(s=this.readCodeByTable(t));)if(s<256)a>=f&&(this.op=a,i=this.expandBuffer(),a=this.op),i[a++]=s;else for(n=s-257,o=r.LengthCodeTable[n],r.LengthExtraTable[n]>0&&(o+=this.readBits(r.LengthExtraTable[n])),s=this.readCodeByTable(e),h=r.DistCodeTable[s],r.DistExtraTable[s]>0&&(h+=this.readBits(r.DistExtraTable[s])),a>=f&&(this.op=a,i=this.expandBuffer(),a=this.op);o--;)i[a]=i[a++-h];for(;this.bitsbuflen>=8;)this.bitsbuflen-=8,this.ip--;this.op=a},r.prototype.decodeHuffmanAdaptive=function(t,e){var i=this.output,a=this.op;this.currentLitlenTable=t;for(var s,n,h,o,f=i.length;256!==(s=this.readCodeByTable(t));)if(s<256)a>=f&&(f=(i=this.expandBuffer()).length),i[a++]=s;else for(n=s-257,o=r.LengthCodeTable[n],r.LengthExtraTable[n]>0&&(o+=this.readBits(r.LengthExtraTable[n])),s=this.readCodeByTable(e),h=r.DistCodeTable[s],r.DistExtraTable[s]>0&&(h+=this.readBits(r.DistExtraTable[s])),a+o>f&&(f=(i=this.expandBuffer()).length);o--;)i[a]=i[a++-h];for(;this.bitsbuflen>=8;)this.bitsbuflen-=8,this.ip--;this.op=a},r.prototype.expandBuffer=function(t){var e=new Uint8Array(this.op-r.MaxBackwardLength),i=this.op-r.MaxBackwardLength,a=this.output;return e.set(a.subarray(r.MaxBackwardLength,e.length)),this.blocks.push(e),this.totalpos+=e.length,a.set(a.subarray(i,i+r.MaxBackwardLength)),this.op=r.MaxBackwardLength,a},r.prototype.expandBufferAdaptive=function(t){var e,i,r,a=this.input.length/this.ip+1|0,s=this.input,n=this.output;return t&&("number"==typeof t.fixRatio&&(a=t.fixRatio),"number"==typeof t.addRatio&&(a+=t.addRatio)),i=a<2?(r=(s.length-this.ip)/this.currentLitlenTable[2]/2*258|0)<n.length?n.length+r:n.length<<1:n.length*a,(e=new Uint8Array(i)).set(n),this.output=e,this.output},r.prototype.concatBuffer=function(){var t,e,i,a,s,n=0,h=this.totalpos+(this.op-r.MaxBackwardLength),o=this.output,f=this.blocks,u=new Uint8Array(h);if(0===f.length)return this.output.subarray(r.MaxBackwardLength,this.op);for(e=0,i=f.length;e<i;++e)for(a=0,s=(t=f[e]).length;a<s;++a)u[n++]=t[a];for(e=r.MaxBackwardLength,i=this.op;e<i;++e)u[n++]=o[e];return this.blocks=[],this.buffer=u,this.buffer},r.prototype.concatBufferDynamic=function(){var t,e=this.op;return this.resize?(t=new Uint8Array(e)).set(this.output.subarray(0,e)):t=this.output.subarray(0,e),this.buffer=t,this.buffer},t.RawInflate=r});
//# sourceMappingURL=sourcemaps/RawInflate.js.map