const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ------------------------------------------------------------------
// 設定値（起動中のローカル開発サーバーのURL）
// ------------------------------------------------------------------
const API_URL = 'http://localhost:3000/api/admin/users/bulk-import';
const ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD;

// Supabase クライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function runTest() {
  console.log('🧪 API動作テストを開始します...');

  // 1. テスト用のテナント（法人）を2つ作成
  console.log('\n[1/5] テスト用テナントの準備...');
  const { data: tenantA, error: errA } = await supabaseAdmin
    .from('tenants')
    .insert({ name: '株式会社テストA（正常系・エラー系検証）' })
    .select('id').single();
    
  const { data: tenantB, error: errB } = await supabaseAdmin
    .from('tenants')
    .insert({ name: '社会福祉法人テストB（兼務検証）' })
    .select('id').single();

  if (errA || errB) {
    console.error('テナント作成に失敗しました:', errA || errB);
    return;
  }
  console.log(`✅ テナントAを作成: ${tenantA.id}`);
  console.log(`✅ テナントBを作成: ${tenantB.id}`);

  // 2. 特権管理者（0xx0001）としてログインし、JWTトークンを取得
  console.log('\n[2/5] 特権管理者としてログイン（JWTトークン取得）...');
  const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (authError || !authData.session) {
    console.error('❌ ログイン失敗（設定した管理者が存在しない可能性があります）:', authError);
    return;
  }
  const token = authData.session.access_token;
  console.log('✅ JWTトークンの取得に成功しました。');

  // ========================================================
  // 3. テスト1: 新規登録とエラー時のロールバックを検証
  // ========================================================
  console.log('\n[3/5] テスト1実行 (新規作成 & ロールバック検証)');
  
  const payloadTest1 = {
    tenantId: tenantA.id,
    userList: [
      {
        // パターンA: 完全に新規のユーザー（正常系）
        email: 'newuser1@test.local',
        password: 'Password123!',
        fullName: '萌佑 太郎',
        staffId: 'TEST-001',
        role: 'employee',
        department: '介護1課'
      },
      {
        // パターンC: わざとエラーを起こすデータ（ロールバック検証）
        // staffId が null になっているため DB の NotNull 制約に違反しエラーになる
        email: 'erroruser1@test.local',
        password: 'Password123!',
        fullName: 'エラー 花子',
        staffId: null, 
        role: 'employee',
        department: '介護2課'
      }
    ]
  };

  const res1 = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payloadTest1)
  });

  const result1 = await res1.json();
  console.log(`APIレスポンス [ステータス: ${res1.status}]:`);
  console.dir(result1, { depth: null, colors: true });

  // ========================================================
  // 4. テスト2: 兼務（Upsert）の追加を検証
  // ========================================================
  console.log('\n[4/5] テスト2実行 (兼務による他テナントへの追加登録)');
  
  const payloadTest2 = {
    tenantId: tenantB.id,
    userList: [
      {
        // パターンB: すでにテナントAで登録されたユーザーを、テナントBにも追加（兼務）
        email: 'newuser1@test.local',
        password: 'Password123!', // 既存ユーザーなのでパスワードは無視される動作になる
        fullName: '萌佑 太郎',
        staffId: 'TEST-001',
        role: 'manager',           // テナントBでは管理者として登録
        department: '兼務管理部'
      }
    ]
  };

  const res2 = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payloadTest2)
  });

  const result2 = await res2.json();
  console.log(`APIレスポンス [ステータス: ${res2.status}]:`);
  console.dir(result2, { depth: null, colors: true });

  // ========================================================
  // 5. 事後確認 (DBを直接チェック)
  // ========================================================
  console.log('\n[5/5] ロールバックの確実性チェック...');
  // エラーになった erroruser1@test.local が、Supabase Auth に殘ってしまっていないか確認
  const { data: ghostCheck } = await supabaseAdmin.auth.admin.listUsers();
  const ghostExists = ghostCheck.users.some(u => u.email === 'erroruser1@test.local');
  if (ghostExists) {
    console.log('❌ 警告: エラー用ユーザーがAuthに残留しています（ロールバック失敗）');
  } else {
    console.log('✅ エラー用ユーザーはAuthに存在しません（ロールバック成功！）');
  }

  console.log('\n✨ 全ての動作テスト完了');
}

runTest();
