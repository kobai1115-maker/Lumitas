const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const prisma = new PrismaClient();

async function setup() {
  console.log('🚀 テストアカウントのセットアップを開始します...');

  const testUsers = [
    { staffId: '1aa0001', email: '1aa0001@lumitas.local', name: '山田 理事長' },
    { staffId: '1aa0002', email: '1aa0002@lumitas.local', name: '佐藤 施設長' },
    { staffId: '1aa0005', email: '1aa0005@lumitas.local', name: '鈴木 太郎' }
  ];

  for (const user of testUsers) {
    console.log(`\n👤 [${user.name}] (ID: ${user.staffId}) の処理中...`);

    // 1. Prisma の更新 (+ ID自体も更新)
    try {
      // 既存の S001 などを 1aa0001 に書き換える
      const oldId = user.staffId === '1aa0001' ? 'S001' : (user.staffId === '1aa0002' ? 'S002' : 'S005');
      
      await prisma.user.upsert({
        where: { staffId: oldId },
        update: { staffId: user.staffId, email: user.email },
        create: { 
          staffId: user.staffId, 
          email: user.email,
          fullName: user.name,
          role: user.staffId === '1aa0001' ? 'ADMIN' : (user.staffId === '1aa0002' ? 'MANAGER' : 'STAFF_CAREGIVER'),
          department: '本部',
          corporationId: 'corp-001'
        }
      });
      console.log(` ✅ Prisma: IDを ${user.staffId}, メールを ${user.email} に同期しました。`);
    } catch (e) {
      console.log(` ⚠️ Prisma: ${user.staffId} の同期中にエラーが発生しましたが、続行します。`, e.message);
    }

    // 2. Supabase Auth への登録
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: user.name }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(` ✅ Auth: すでに登録済みです。`);
      } else {
        console.error(` ❌ Auth: エラー:`, authError.message);
      }
    } else {
      console.log(` ✅ Auth: ユーザー ${user.email} を新規登録しました。`);
    }
  }

  console.log('\n✨ セットアップが完了しました！');
}

setup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
