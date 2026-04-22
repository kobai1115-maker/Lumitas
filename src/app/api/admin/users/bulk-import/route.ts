import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerAuthUser } from '@/lib/auth-server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { user, error } = await getServerAuthUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // システム管理者(DEVELOPER)のみがこのバルクインポート(全テナント対象)を実行可能
    if (user.role !== 'DEVELOPER') {
      return NextResponse.json({ error: 'Access Denied. System Admin Only.' }, { status: 403 });
    }

    const { tenantId, userList } = await req.json();
    if (!tenantId || !Array.isArray(userList)) {
      return NextResponse.json({ error: 'Invalid Payload' }, { status: 400 });
    }

    const results = [];

    for (const userData of userList) {
      const { email, password, fullName, staffId, role, department } = userData;
      let targetUserId = null;
      let isNewUser = false; // 新規作成フラグ（ロールバック判定用）

      try {
        // 【要件】既存ユーザーのチェック (兼務対応)
        const { data: existingProfile } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingProfile) {
          // すでに登録済みの場合は、そのIDを流用（AuthとProfileの作成をスキップ）
          targetUserId = existingProfile.id;
        } else {
          // 新規ユーザーの場合
          isNewUser = true;

          // 1. Supabase Auth にアカウントを作成
          const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
          });
          if (createUserError) throw createUserError;
          targetUserId = authData.user.id;

          // 2. Profile (users) テーブルに登録
          const { error: profileError } = await supabaseAdmin.from('users').insert({
            id: targetUserId,
            email,
            full_name: fullName,
            staff_id: staffId
          });
          if (profileError) throw profileError;
        }

        // 3. User_Tenants に登録（既存の兼務更新も考慮して upsert にする）
        const { error: tenantError } = await supabaseAdmin.from('user_tenants').upsert({
          user_id: targetUserId,
          tenant_id: tenantId,
          role: role || 'GENERAL',
          department: department
        }, { onConflict: 'user_id, tenant_id' }); // 重複時は上書き
        if (tenantError) throw tenantError;

        results.push({ email, status: 'success', isNewUser });

      } catch (err: any) {
        console.error(`Failed to process user ${userData.email}:`, err);
        
        // 【要件】新規作成中にエラーが起きた場合のロールバック処理
        if (isNewUser && targetUserId) {
          console.log(`Rolling back Auth user creation for ${email}`);
          await supabaseAdmin.auth.admin.deleteUser(targetUserId);
        }
        
        results.push({ email: userData.email, status: 'error', message: err.message });
      }
    }

    return NextResponse.json({ message: 'Import completed', results }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
