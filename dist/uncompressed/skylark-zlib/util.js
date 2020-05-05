define([
  "./zlib"
],function(Zlib) {
  /**
   * @fileoverview 雑多な関数群をまとめたモジュール実装.
   */
  var Util = {};

  /**
   * Byte String から Byte Array に変換.
   * @param {!string} str byte string.
   * @return {!Array.<number>} byte array.
   */
  Util.stringToByteArray = function(str) {
    /** @type {!Array.<(string|number)>} */
    var tmp = str.split('');
    /** @type {number} */
    var i;
    /** @type {number} */
    var il;

    for (i = 0, il = tmp.length; i < il; i++) {
      tmp[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
    }

    return tmp;
  };

  return Zlib.Util = Util;

});


