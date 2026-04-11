/**
 * enable-rls.js
 * ────────────────────────────────────────────
 * Supabaseリンターで指摘された全テーブルに対して
 * 行レベルセキュリティ（RLS）を有効化するスクリプト。
 *
 * 実行: node scripts/enable-rls.js
 * ────────────────────────────────────────────
 */
const { Client } = require('pg');
require('dotenv').config();

// RLS を有効化する対象テーブル一覧（Supabase Linter で指摘されたもの）
const TABLES = [
  'Corporation',
  'Division',
  'Facility',
  'Unit',
  'User',
  'OrgGoal',
  'Evaluation',
  'Goal',
  'PeerBonus',
  'IncidentReport',
  'HealthLog',
  'OneOnOneNote',
  'TrainingRecord',
];

async function enableRLS() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL が設定されていません。.env を確認してください。');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ データベースに接続しました。\n');

    // --- Step 1: 現在の RLS 状態を確認 ---
    console.log('📋 現在の RLS 状態を確認中...');
    const before = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = ANY($1)
      ORDER BY tablename;
    `, [TABLES]);

    before.rows.forEach(row => {
      const status = row.rowsecurity ? '🟢 有効' : '🔴 無効';
      console.log(`  ${status}  ${row.tablename}`);
    });

    // --- Step 2: RLS を有効化 ---
    console.log('\n🔒 RLS を有効化しています...');
    let successCount = 0;
    let skipCount = 0;

    for (const table of TABLES) {
      try {
        await client.query(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
        console.log(`  ✅ ${table} — RLS 有効化完了`);
        successCount++;
      } catch (err) {
        console.error(`  ❌ ${table} — エラー: ${err.message}`);
      }
    }

    // --- Step 3: 有効化後の状態を確認 ---
    console.log('\n📋 有効化後の RLS 状態を確認中...');
    const after = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = ANY($1)
      ORDER BY tablename;
    `, [TABLES]);

    after.rows.forEach(row => {
      const status = row.rowsecurity ? '🟢 有効' : '🔴 無効';
      console.log(`  ${status}  ${row.tablename}`);
    });

    // --- サマリー ---
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ 完了: ${successCount} テーブルで RLS を有効化しました。`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n💡 注意: RLS を有効化した状態では、ポリシーが設定されていないテーブルへの`);
    console.log(`   PostgREST（Supabase API）経由のアクセスはデフォルトで拒否されます。`);
    console.log(`   Prisma（直接接続）はテーブルオーナー権限で接続するため影響ありません。`);

  } catch (err) {
    console.error('❌ 接続またはクエリ実行エラー:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

enableRLS();
