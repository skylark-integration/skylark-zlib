/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib","./util"],function(t,r){var e=function(t){return"string"==typeof t&&(t=r.stringToByteArray(t)),e.update(1,t)};return e.update=function(t,r){for(var i,n=65535&t,a=t>>>16&65535,o=r.length,u=0;o>0;){o-=i=o>e.OptimizationParameter?e.OptimizationParameter:o;do{a+=n+=r[u++]}while(--i);n%=65521,a%=65521}return(a<<16|n)>>>0},e.OptimizationParameter=1024,t.Adler32=e});
//# sourceMappingURL=sourcemaps/adler32.js.map
