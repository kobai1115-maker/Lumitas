const { Client } = require('pg');
require('dotenv').config();

async function fixSearchPath() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    // handle_new_user はSupabase Authからトリガーされる関数。search_pathを固定して権限昇格の脆弱性を防ぐ。
    await client.query(`ALTER FUNCTION public.handle_new_user() SET search_path = public;`);
    console.log('✅ public.handle_new_user の search_path を public に固定しました。');
  } catch (err) {
    console.error('❌ エラー:', err.message);
  } finally {
    await client.end();
  }
}

fixSearchPath();
