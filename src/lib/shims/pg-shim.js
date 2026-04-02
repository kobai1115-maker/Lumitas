/**
 * Moyuukai Lumitas - Patched Connection String Parser
 * Cloudflare Pages でのエラー原因である 'fs' 依存を完全に排除したクリーンな部品です。
 */
'use strict';

function parse(url) {
  if (!url) return {};
  const urlObj = new URL(url);
  const config = {
    user: decodeURIComponent(urlObj.username),
    password: decodeURIComponent(urlObj.password),
    host: urlObj.hostname,
    port: urlObj.port || '5432',
    database: urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname,
    ssl: urlObj.searchParams.get('sslmode') !== 'disable'
  };
  
  // ファイル (fs) を読み込もうとするロジックを完全に削除
  return config;
}

module.exports = { parse };
