/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib"],function(t){var e=function(t){this.buffer=new Uint16Array(2*t),this.length=0};return e.prototype.getParent=function(t){return 2*((t-2)/4|0)},e.prototype.getChild=function(t){return 2*t+2},e.prototype.push=function(t,e){var n,h,i,r=this.buffer;for(n=this.length,r[this.length++]=e,r[this.length++]=t;n>0&&(h=this.getParent(n),r[n]>r[h]);)i=r[n],r[n]=r[h],r[h]=i,i=r[n+1],r[n+1]=r[h+1],r[h+1]=i,n=h;return this.length},e.prototype.pop=function(){var t,e,n,h,i,r=this.buffer;for(e=r[0],t=r[1],this.length-=2,r[0]=r[this.length],r[1]=r[this.length+1],i=0;!((h=this.getChild(i))>=this.length)&&(h+2<this.length&&r[h+2]>r[h]&&(h+=2),r[h]>r[i]);)n=r[i],r[i]=r[h],r[h]=n,n=r[i+1],r[i+1]=r[h+1],r[h+1]=n,i=h;return{index:t,value:e,length:this.length}},t.Heap=e});
//# sourceMappingURL=sourcemaps/Heap.js.map
