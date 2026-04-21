const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const prisma = new PrismaClient();

async function registerAdmin() {
  const email = 'test-admin@example.com';
  const fullName = 'AXLINK管理者';
  const staffId = 'SYS-AXLINK-01';
  const password = 'password123';

  console.log(`🚀 [${fullName}] アカウントの作成を開始します...`);

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
      // Supabaseのメッセージが変更された場合にも対応
      if (authError.message.includes('already registered') || authError.status === 422) {
        console.log(` 💡 Supabase Auth: すでにアカウントが存在します。既存のIDを取得中...`);
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        const existingUser = listData.users.find(u => u.email === email);
        if (!existingUser) throw new Error('Existing user not found in Supabase Auth list');
        userId = existingUser.id;
        
        // パスワードを初期化（念のため）
        await supabaseAdmin.auth.admin.updateUserById(userId, { password: password });
        console.log(` ✅ Supabase Auth: 既存ユーザーを取得しました (ID: ${userId})`);
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
        role: 'DEVELOPER',
        department: 'システム管理',
        isActive: true,
        mustChangePassword: false,
        updatedAt: new Date()
      },
      create: {
        id: userId,
        email: email,
        fullName: fullName,
        staffId: staffId,
        role: 'DEVELOPER',
        department: 'システム管理',
        isActive: true,
        mustChangePassword: false,
        updatedAt: new Date()
      }
    });

    console.log(` ✅ Prisma DB: 登録完了`);
    console.log(`\n✨ アカウント作成が正常に終了しました！`);
    console.log(`----------------------------------------`);
    console.log(` ログインID: ${email} (または ${staffId})`);
    console.log(` パスワード: ${password}`);
    console.log(` ロール: ${user.role}`);
    console.log(`----------------------------------------`);

  } catch (error) {
    console.error(` ❌ エラーが発生しました:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

registerAdmin();
