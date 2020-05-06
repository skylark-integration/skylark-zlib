/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib","./RawInflateStream"],function(t,i){var e=function(t){this.input=void 0===t?new Uint8Array:t,this.ip=0,this.rawinflate=new i(this.input,this.ip),this.method,this.output=this.rawinflate.output};return e.prototype.decompress=function(t){var i;if(void 0!==t){var e=new Uint8Array(this.input.length+t.length);e.set(this.input,0),e.set(t,this.input.length),this.input=e}return void 0===this.method&&this.readHeader()<0?new Uint8Array:(i=this.rawinflate.decompress(this.input,this.ip),0!==this.rawinflate.ip&&(this.input=this.input.subarray(this.rawinflate.ip),this.ip=0),i)},e.prototype.readHeader=function(){var i=this.ip,e=this.input,r=e[i++],n=e[i++];if(void 0===r||void 0===n)return-1;switch(15&r){case t.CompressionMethod.DEFLATE:this.method=t.CompressionMethod.DEFLATE;break;default:throw new Error("unsupported compression method")}if(((r<<8)+n)%31!=0)throw new Error("invalid fcheck flag:"+((r<<8)+n)%31);if(32&n)throw new Error("fdict flag is not supported");this.ip=i},t.InflateStream=e});
//# sourceMappingURL=sourcemaps/InflateStream.js.map
