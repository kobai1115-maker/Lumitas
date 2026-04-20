const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applySql() {
  // DATABASE_URL を使用して Supabase DB に直接接続
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ エラー: .env に DATABASE_URL が設定されていません。');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ データベースに接続しました。');

    const sqlPath = path.join(__dirname, 'multitenant_schema.sql');
    const sqlQuery = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 マルチテナント用のSQLを適用中...');
    await client.query(sqlQuery);
    console.log('✨ SQLの適用が完了しました！ (テーブルとRLSが作成されました)');

  } catch (error) {
    console.error('❌ SQL実行エラー:', error.message);
  } finally {
    await client.end();
  }
}

applySql();
