import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Supabase Admin クライアント（サーバーサイド専用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// スタッフ一覧取得
export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      orderBy: [{ department: 'asc' }, { fullName: 'asc' }],
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        gradeLevel: true,
        department: true,
        welfarePoints: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      }
    })
    return NextResponse.json(staff)
  } catch (error) {
    console.error('GET /api/admin/staff error:', error)
    return NextResponse.json({ error: 'スタッフ情報の取得に失敗しました' }, { status: 500 })
  }
}

// スタッフ新規作成（ADMIN専用）
export async function POST(req: Request) {
  try {
    const { email, password, fullName, role, gradeLevel, department } = await req.json()

    if (!email || !password || !fullName || !role || !department) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    // 1. Supabase Auth にユーザーを作成
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認不要で即時有効化
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || '認証ユーザーの作成に失敗しました' }, { status: 500 })
    }

    // 2. Prisma の User テーブルにプロフィール情報を保存
    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        fullName,
        role,
        gradeLevel: gradeLevel || 1,
        department,
        isActive: true,
        mustChangePassword: true, // 初回ログイン時にパスワード変更を促す
      }
    })

    return NextResponse.json({ success: true, user: newUser })
  } catch (error) {
    console.error('POST /api/admin/staff error:', error)
    return NextResponse.json({ error: 'スタッフの作成に失敗しました' }, { status: 500 })
  }
}

// スタッフ情報更新（権限変更・アカウント停止など）
export async function PATCH(req: Request) {
  try {
    const { id, role, gradeLevel, department, isActive, fullName } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(gradeLevel !== undefined && { gradeLevel }),
        ...(department && { department }),
        ...(isActive !== undefined && { isActive }),
        ...(fullName && { fullName }),
      }
    })

    // アカウント無効化の場合はSupabase Auth側でもBANする
    if (isActive === false) {
      await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '87600h' })
    } else if (isActive === true) {
      await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: 'none' })
    }

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('PATCH /api/admin/staff error:', error)
    return NextResponse.json({ error: 'スタッフ情報の更新に失敗しました' }, { status: 500 })
  }
}
