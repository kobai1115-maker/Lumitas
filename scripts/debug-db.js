const { Client } = require('pg');
require('dotenv').config();

async function checkTables() {
  const connectionString = process.env.DATABASE_URL;
  console.log('🔍 データベース接続文字列（末尾省略）:', connectionString.substring(0, 50) + '...');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ データベースに直接接続しました。');

    const res = await client.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `);

    console.log('\n📊 存在するテーブル一覧:');
    if (res.rows.length === 0) {
      console.log('⚠️  publicスキーマ内にテーブルが見つかりません（空です）。');
    } else {
      res.rows.forEach(row => console.log(`- ${row.tablename}`));
    }

  } catch (err) {
    console.error('❌ 接続またはクエリ実行エラー:');
    console.error(err);
  } finally {
    await client.end();
  }
}

checkTables();
