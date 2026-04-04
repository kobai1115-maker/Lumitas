const { Client } = require('pg');
require('dotenv').config();

async function testDirect() {
  const directUrl = "postgresql://postgres:!nbaLY*vGLW4pGE@db.yecrynxhhurpncgmtgum.supabase.co:5432/postgres";
  console.log('🔗 直接接続（修正版）をテストします: db.yecrynxhhurpncgmtgum.supabase.co:5432');
  
  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ 直接接続に成功しました！');
  } catch (err) {
    console.error('❌ 直接接続に失敗しました:');
    console.error(err.message);
  } finally {
    await client.end();
  }
}

testDirect();
