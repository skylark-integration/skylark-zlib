/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib"],function(r){var t={stringToByteArray:function(r){var t,n,e=r.split("");for(t=0,n=e.length;t<n;t++)e[t]=(255&e[t].charCodeAt(0))>>>0;return e}};return r.Util=t});
//# sourceMappingURL=sourcemaps/util.js.map
