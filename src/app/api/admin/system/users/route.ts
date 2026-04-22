import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'
import { withCompat } from '@/lib/api-utils'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function checkAuth() {
  const { user } = await getServerAuthUser()
  if (!user || user.role !== 'DEVELOPER') {
    return null
  }
  return user
}

export async function GET(req: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || 'MAIN_ADMIN'

    const users = await prisma.user.findMany({
      where: {
        role: role as any
      },
      include: {
        Corporation: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(withCompat(users))
  } catch (error) {
    console.error('GET /api/admin/system/users error:', error)
    return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const currentUser = await checkAuth()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { corporationId, staffId, fullName, email, password } = body

    if (!corporationId || !staffId || !fullName || !email) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    if (staffId.length !== 7) {
      return NextResponse.json({ error: '職員IDは7桁で入力してください' }, { status: 400 })
    }

    // 1. Supabase Auth に作成
    const supabaseAdmin = getSupabaseAdmin()
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'CareGrow2026',
      email_confirm: true,
      user_metadata: {
        staffId,
        fullName,
        role: 'MAIN_ADMIN'
      }
    })

    if (authError) {
      return NextResponse.json({ error: `認証アカウント作成エラー: ${authError.message}` }, { status: 400 })
    }

    // 2. Prisma に作成
    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        staffId,
        email,
        fullName,
        role: 'MAIN_ADMIN',
        department: '管理部', // デフォルト
        isActive: true,
        mustChangePassword: true,
        corporationId,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(withCompat(newUser))
  } catch (error) {
    console.error('POST /api/admin/system/users error:', error)
    return NextResponse.json({ error: 'ユーザー作成に失敗しました' }, { status: 500 })
  }
}
