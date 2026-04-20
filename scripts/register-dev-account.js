const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const prisma = new PrismaClient();

async function registerDevAccount() {
  // 環境変数から取得（設定されていない場合はエラーを出す）
  const email = process.env.DEV_ADMIN_EMAIL;
  const password = process.env.DEV_ADMIN_PASSWORD;
  const fullName = '開発管理者';
  const staffId = '0xx0001';

  if (!email || !password) {
    console.error('❌ エラー: .env に DEV_ADMIN_EMAIL または DEV_ADMIN_PASSWORD が設定されていません。');
    process.exit(1);
  }

  console.log(`🚀 [${fullName}] 開発者アカウントの作成を開始します...`);

  try {
    // 1. Supabase Auth への登録
    console.log(`📡 Supabase Auth にユーザーを登録中... (${email})`);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    let userId;
    if (authError) {
      if (authError.message.includes('already registered') || authError.status === 422) {
        console.log(` 💡 Supabase Auth: すでにアカウントが存在します。既存のIDを取得中...`);
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        const existingUser = listData.users.find(u => u.email === email);
        if (!existingUser) throw new Error('Existing user not found in Supabase Auth list');
        userId = existingUser.id;
        
        // パスワードを更新
        await supabaseAdmin.auth.admin.updateUserById(userId, { password: password });
        console.log(` ✅ Supabase Auth: 既存ユーザーを取得しパスワードを更新しました (ID: ${userId})`);
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
      console.log(` ✅ Supabase Auth: 登録完了 (ID: ${userId})`);
    }

    // 2. Prisma DB への登録 (SYSTEM_ADMIN ロール)
    console.log(` 🗄️  Prisma DB にユーザー情報を登録中...`);
    const user = await prisma.user.upsert({
      where: { email: email },
      update: {
        id: userId,
        fullName: fullName,
        staffId: staffId,
        role: 'SYSTEM_ADMIN',
        department: 'システム開発',
        isActive: true,
        mustChangePassword: false
      },
      create: {
        id: userId,
        email: email,
        fullName: fullName,
        staffId: staffId,
        role: 'SYSTEM_ADMIN',
        department: 'システム開発',
        isActive: true,
        mustChangePassword: false
      }
    });

    console.log(` ✅ Prisma DB: 登録完了`);
    console.log(`\n✨ アカウント登録が正常に終了しました！`);
    console.log(`----------------------------------------`);
    console.log(` ログインID: ${email}`);
    console.log(` スタッフID: ${staffId}`);
    console.log(` パスワード: ( .env に設定されたもの )`);
    console.log(` ロール: ${user.role}`);
    console.log(`----------------------------------------`);

  } catch (error) {
    console.error(` ❌ エラーが発生しました:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

registerDevAccount();
