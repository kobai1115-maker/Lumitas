/**
 * Moyuukai Lumitas - Patched PGPass
 * 'fs' エラーを回避するため、何もしない安全な部品です。
 */
'use strict';

module.exports = {
  warnTo: function() {},
  lookup: function(config, cb) {
    if (typeof cb === 'function') cb();
    return undefined;
  }
};
