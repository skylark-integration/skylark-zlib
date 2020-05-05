/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib"],function(e){var i=function(e,t){if(this.index="number"==typeof t?t:0,this.bitindex=0,this.buffer=e instanceof Uint8Array?e:new Uint8Array(i.DefaultBlockSize),2*this.buffer.length<=this.index)throw new Error("invalid index");this.buffer.length<=this.index&&this.expandBuffer()};return i.DefaultBlockSize=32768,i.prototype.expandBuffer=function(){var e=this.buffer,i=e.length,t=new Uint8Array(i<<1);return t.set(e),this.buffer=t},i.prototype.writeBits=function(e,t,r){var n,f=this.buffer,s=this.index,u=this.bitindex,a=f[s];if(r&&t>1&&(e=t>8?function(e){return i.ReverseTable[255&e]<<24|i.ReverseTable[e>>>8&255]<<16|i.ReverseTable[e>>>16&255]<<8|i.ReverseTable[e>>>24&255]}(e)>>32-t:i.ReverseTable[e]>>8-t),t+u<8)a=a<<t|e,u+=t;else for(n=0;n<t;++n)a=a<<1|e>>t-n-1&1,8==++u&&(u=0,f[s++]=i.ReverseTable[a],a=0,s===f.length&&(f=this.expandBuffer()));f[s]=a,this.buffer=f,this.bitindex=u,this.index=s},i.prototype.finish=function(){var e=this.buffer,t=this.index;return this.bitindex>0&&(e[t]<<=8-this.bitindex,e[t]=i.ReverseTable[e[t]],t++),e.subarray(0,t)},i.ReverseTable=function(){var e,i=new Uint8Array(256);for(e=0;e<256;++e)i[e]=function(e){var i=e,t=7;for(e>>>=1;e;e>>>=1)i<<=1,i|=1&e,--t;return(i<<t&255)>>>0}(e);return i}(),e.BitStream=i});
//# sourceMappingURL=sourcemaps/BitStream.js.map
