/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib"],function(r){var f={buildHuffmanTable:function(r){var f,n,e,u,i,o,a,t,I,b,l,m=r.length,N=0,T=Number.POSITIVE_INFINITY;for(t=0,I=m;t<I;++t)r[t]>N&&(N=r[t]),r[t]<T&&(T=r[t]);for(f=1<<N,n=new Uint32Array(f),e=1,u=0,i=2;e<=N;){for(t=0;t<m;++t)if(r[t]===e){for(o=0,a=u,b=0;b<e;++b)o=o<<1|1&a,a>>=1;for(l=e<<16|t,b=o;b<f;b+=i)n[b]=l;++u}++e,u<<=1,i<<=1}return[n,N,T]}};return r.Huffman=f});
//# sourceMappingURL=sourcemaps/huffman.js.map
