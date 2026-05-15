/**
 * Lumitas MFA Handler (GAS)
 * 管理者向けの2段階認証コード生成・送信・検証用スクリプト
 */

const SECRET_TOKEN = "LUMITAS_MFA_SECRET_2026"; // Next.js側と一致させる

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const { action, email, code, token } = data;

  // 簡単なトークン認証
  if (token !== SECRET_TOKEN) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
  }

  const cache = CacheService.getScriptCache();

  if (action === "send") {
    // 6桁の認証コードを生成
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // キャッシュに5分間保存
    cache.put(email, otp, 300);

    // メール送信
    MailApp.sendEmail({
      to: email,
      subject: "【ルミタス】2段階認証コードのご案内",
      body: `ルミタスへのログインを完了するには、以下の認証コードを入力してください。\n\n認証コード: ${otp}\n\n※このコードの有効期限は5分間です。`
    });

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "verify") {
    const savedOtp = cache.get(email);
    if (savedOtp && savedOtp === code) {
      cache.remove(email); // 一度使ったコードは無効化
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid or expired code" })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unknown action" })).setMimeType(ContentService.MimeType.JSON);
}
