/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib","./adler32","./RawInflate"],function(i,e,r){var t=function(e,t){var s,f;switch(this.input=e,this.ip=0,this.rawinflate,this.verify,!t&&(t={})||(t.index&&(this.ip=t.index),t.verify&&(this.verify=t.verify)),s=e[this.ip++],f=e[this.ip++],15&s){case i.CompressionMethod.DEFLATE:this.method=i.CompressionMethod.DEFLATE;break;default:throw new Error("unsupported compression method")}if(((s<<8)+f)%31!=0)throw new Error("invalid fcheck flag:"+((s<<8)+f)%31);if(32&f)throw new Error("fdict flag is not supported");this.rawinflate=new r(e,{index:this.ip,bufferSize:t.bufferSize,bufferType:t.bufferType,resize:t.resize})};return t.BufferType=r.BufferType,t.prototype.decompress=function(){var i,r=this.input;if(i=this.rawinflate.decompress(),this.ip=this.rawinflate.ip,this.verify&&(r[this.ip++]<<24|r[this.ip++]<<16|r[this.ip++]<<8|r[this.ip++])>>>0!==e(i))throw new Error("invalid adler-32 checksum");return i},i.Inflate=t});
//# sourceMappingURL=sourcemaps/Inflate.js.map
