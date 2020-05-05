/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib"],function(i){}),goog.provide("Zlib.InflateStream"),goog.require("USE_TYPEDARRAY"),goog.require("Zlib"),goog.require("Zlib.RawInflateStream"),goog.scope(function(){Zlib.InflateStream=function(i){this.input=void 0===i?new(USE_TYPEDARRAY?Uint8Array:Array):i,this.ip=0,this.rawinflate=new Zlib.RawInflateStream(this.input,this.ip),this.method,this.output=this.rawinflate.output},Zlib.InflateStream.prototype.decompress=function(i){var t;if(void 0!==i)if(USE_TYPEDARRAY){var e=new Uint8Array(this.input.length+i.length);e.set(this.input,0),e.set(i,this.input.length),this.input=e}else this.input=this.input.concat(i);return void 0===this.method&&this.readHeader()<0?new(USE_TYPEDARRAY?Uint8Array:Array):(t=this.rawinflate.decompress(this.input,this.ip),0!==this.rawinflate.ip&&(this.input=USE_TYPEDARRAY?this.input.subarray(this.rawinflate.ip):this.input.slice(this.rawinflate.ip),this.ip=0),t)},Zlib.InflateStream.prototype.readHeader=function(){var i=this.ip,t=this.input,e=t[i++],r=t[i++];if(void 0===e||void 0===r)return-1;switch(15&e){case Zlib.CompressionMethod.DEFLATE:this.method=Zlib.CompressionMethod.DEFLATE;break;default:throw new Error("unsupported compression method")}if(((e<<8)+r)%31!=0)throw new Error("invalid fcheck flag:"+((e<<8)+r)%31);if(32&r)throw new Error("fdict flag is not supported");this.ip=i}});
//# sourceMappingURL=sourcemaps/InflateStream.js.map
