/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib","./adler32","./RawDeflate"],function(e,t,s){var o=function(e,t){this.input=e,this.output=new Uint8Array(o.DefaultBufferSize),this.compressionType=o.CompressionType.DYNAMIC,this.rawDeflate;var r,i={};for(r in!t&&(t={})||"number"==typeof t.compressionType&&(this.compressionType=t.compressionType),t)i[r]=t[r];i.outputBuffer=this.output,this.rawDeflate=new s(this.input,i)};return o.DefaultBufferSize=32768,o.CompressionType=s.CompressionType,o.compress=function(e,t){return new o(e,t).compress()},o.prototype.compress=function(){var r,i,n,p,a,u,h,f=0;switch(h=this.output,r=e.CompressionMethod.DEFLATE){case e.CompressionMethod.DEFLATE:i=Math.LOG2E*Math.log(s.WindowSize)-8;break;default:throw new Error("invalid compression method")}switch(n=i<<4|r,h[f++]=n,0,r){case e.CompressionMethod.DEFLATE:switch(this.compressionType){case o.CompressionType.NONE:a=0;break;case o.CompressionType.FIXED:a=1;break;case o.CompressionType.DYNAMIC:a=2;break;default:throw new Error("unsupported compression type")}break;default:throw new Error("invalid compression method")}return p=a<<6|0,p|=31-(256*n+p)%31,h[f++]=p,u=t(this.input),this.rawDeflate.op=f,f=(h=this.rawDeflate.compress()).length,(h=new Uint8Array(h.buffer)).length<=f+4&&(this.output=new Uint8Array(h.length+4),this.output.set(h),h=this.output),(h=h.subarray(0,f+4))[f++]=u>>24&255,h[f++]=u>>16&255,h[f++]=u>>8&255,h[f++]=255&u,h},e.Deflate=o});
//# sourceMappingURL=sourcemaps/Deflate.js.map
