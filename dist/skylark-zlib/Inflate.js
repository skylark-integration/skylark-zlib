/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib"],function(i){var e=function(e,r){var t,s;switch(this.input=e,this.ip=0,this.rawinflate,this.verify,!r&&(r={})||(r.index&&(this.ip=r.index),r.verify&&(this.verify=r.verify)),t=e[this.ip++],s=e[this.ip++],15&t){case i.CompressionMethod.DEFLATE:this.method=i.CompressionMethod.DEFLATE;break;default:throw new Error("unsupported compression method")}if(((t<<8)+s)%31!=0)throw new Error("invalid fcheck flag:"+((t<<8)+s)%31);if(32&s)throw new Error("fdict flag is not supported");this.rawinflate=new RawInflate(e,{index:this.ip,bufferSize:r.bufferSize,bufferType:r.bufferType,resize:r.resize})};return e.BufferType=RawInflate.BufferType,e.prototype.decompress=function(){var i,e=this.input;if(i=this.rawinflate.decompress(),this.ip=this.rawinflate.ip,this.verify&&(e[this.ip++]<<24|e[this.ip++]<<16|e[this.ip++]<<8|e[this.ip++])>>>0!==Adler32(i))throw new Error("invalid adler-32 checksum");return i},i.Inflate=e});
//# sourceMappingURL=sourcemaps/Inflate.js.map
