import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

import { createClient } from '@supabase/supabase-js'

import { withCompat } from '@/lib/api-utils'

// Supabase Admin クライアント取得関数（サーバーサイド専用）
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// 1. スタッフ一覧取得 (法人IDでフィルタリング)
export async function GET(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isActive = searchParams.get('isActive') === 'true'

    // フィルタ条件の構築
    const where: any = {
      corporationId: user.corporationId,
      isActive: isActive
    }

    // [権限管理] 法人管理者以外は、自施設のデータのみに制限
    if (user.role !== 'MAIN_ADMIN') {
      where.facilityId = user.facilityId
    }

    const staffList = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        Facility: { select: { name: true } },
        Division: { select: { name: true } }
      }
    })
    return NextResponse.json(withCompat(staffList))
  } catch (error) {
    console.error('GET /api/admin/staff error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}

// 2. スタッフ新規作成
export async function POST(req: Request) {
  try {
    const { user: currentUser, error: authError } = await getServerAuthUser()
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      staffId, 
      fullName, 
      fullNameKana,
      email, 
      role, 
      gradeLevel, 
      department,
      facilityId: targetFacilityId,
      divisionId: targetDivisionId,
      birthday,
      hireDate,
      yearsOfService,
      experienceYears
    } = body
    
    // 1. バリデーション
    if (!staffId || staffId.length !== 7) {
      return NextResponse.json({ error: '職員IDは必ず7桁で入力してください（例: 1aa0001）' }, { status: 400 })
    }
    if (!fullName) {
      return NextResponse.json({ error: '氏名は必須入力です' }, { status: 400 })
    }

    const loginEmail = email || `${staffId}@moyuukai.local`

    // 2. 重複チェック (Prisma)
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { staffId: staffId },
          { email: loginEmail }
        ]
      }
    })

    if (existing) {
      const field = existing.staffId === staffId ? '職員ID' : 'メールアドレス'
      return NextResponse.json({ error: `この${field}は既に登録されています` }, { status: 400 })
    }

    // [権限管理] 法人管理者以外は、他施設の職員を登録できない
    if (currentUser.role !== 'MAIN_ADMIN' && currentUser.role !== 'DEVELOPER') {
      if (targetFacilityId && targetFacilityId !== currentUser.facilityId) {
        return NextResponse.json({ error: '他施設の職員を登録する権限がありません' }, { status: 403 })
      }
    }

    const corporationId = currentUser.corporationId || body.corporationId

    // 3. Supabase Auth ユーザー作成
    const supabaseAdmin = getSupabaseAdmin()
    const { data: authData, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password: 'CareGrow2026', // デフォルトパスワード
      email_confirm: true,
      user_metadata: {
        staffId,
        fullName,
        role
      }
    })

    if (supabaseError) {
      console.error('Supabase Auth creation error:', supabaseError)
      return NextResponse.json({ 
        error: `認証アカウントの作成に失敗しました: ${supabaseError.message}` 
      }, { status: 400 })
    }

    const supabaseUserId = authData.user.id

    try {
      // 4. Prisma ユーザー作成 (IDを同期)
      const newUser = await prisma.user.create({
        data: {
          id: supabaseUserId,
          staffId,
          email: loginEmail,
          fullName,
          fullNameKana,
          role,
          gradeLevel: parseInt(gradeLevel) || 1,
          department: department || '介護課',
          birthday: birthday ? new Date(birthday) : null,
          hireDate: hireDate ? new Date(hireDate) : null,
          yearsOfService: parseInt(yearsOfService) || 0,
          experienceYears: parseInt(experienceYears) || 0,
          corporationId,
          facilityId: targetFacilityId || currentUser.facilityId,
          divisionId: targetDivisionId || currentUser.divisionId,
          isActive: true,
          mustChangePassword: true,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({ success: true, user: newUser })
    } catch (prismaError) {
      console.error('Prisma creation error, rolling back Supabase user:', prismaError)
      // ロールバック: Supabase 側のユーザーを削除
      await supabaseAdmin.auth.admin.deleteUser(supabaseUserId)
      return NextResponse.json({ error: 'データベースへの保存に失敗しました。認証アカウントをロールバックしました。' }, { status: 500 })
    }

  } catch (error) {
    console.error('POST /api/admin/staff error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// 3. スタッフ情報更新
export async function PATCH(req: Request) {
  try {
    const { id, staffId, role, gradeLevel, department, isActive, fullName, fullNameKana, birthday, hireDate, yearsOfService, experienceYears } = await req.json()

    // 職員IDの変更がある場合、7桁チェック
    if (staffId && staffId.length !== 7) {
      return NextResponse.json({ error: '職員IDは必ず7桁で入力してください' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(staffId && { staffId }),
        ...(role && { role }),
        ...(gradeLevel != null && { gradeLevel }),
        ...(department && { department }),
        ...(isActive != null && { isActive }),
        ...(fullName && { fullName }),
        ...(fullNameKana !== undefined && { fullNameKana }),
        ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
        ...(hireDate !== undefined && { hireDate: hireDate ? new Date(hireDate) : null }),
        ...(yearsOfService != null && { yearsOfService: parseInt(yearsOfService) }),
        ...(experienceYears != null && { experienceYears: parseInt(experienceYears) }),
      }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('PATCH /api/admin/staff error:', error)
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }
}
