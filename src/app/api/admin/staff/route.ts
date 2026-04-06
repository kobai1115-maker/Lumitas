import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

import { createClient } from '@supabase/supabase-js'

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
    if (user.role !== 'ADMIN') {
      where.facilityId = user.facilityId
    }

    const staffList = await (prisma.user as any).findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        facility: { select: { name: true } },
        division: { select: { name: true } }
      }
    })
    return NextResponse.json(staffList)
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

    const { 
      staffId, 
      fullName, 
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
    } = await req.json()
    
    // 職員IDのバリデーション (7桁)
    if (!staffId || staffId.length !== 7) {
      return NextResponse.json({ error: '職員IDは必ず7桁で入力してください（例: 1aa0001）' }, { status: 400 })
    }

    // [権限管理] 法人管理者以外は、他施設の職員を登録できない
    if (currentUser.role !== 'ADMIN') {
      if (targetFacilityId && targetFacilityId !== currentUser.facilityId) {
        return NextResponse.json({ error: '他施設の職員を登録する権限がありません' }, { status: 403 })
      }
    }

    const corporationId = currentUser.corporationId

    const newUser = await prisma.user.create({
      data: {
        staffId,
        email: email || `${staffId}@moyuukai.local`,
        fullName,
        role,
        gradeLevel: gradeLevel || 1,
        department,
        birthday: birthday ? new Date(birthday) : null,
        hireDate: hireDate ? new Date(hireDate) : null,
        yearsOfService: parseInt(yearsOfService) || 0,
        experienceYears: parseInt(experienceYears) || 0,
        corporationId,
        isActive: true,
        mustChangePassword: true,
      }
    })

    return NextResponse.json({ success: true, user: newUser })
  } catch (error) {
    console.error('POST /api/admin/staff error:', error)
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 })
  }
}

// 3. スタッフ情報更新
export async function PATCH(req: Request) {
  try {
    const { id, staffId, role, gradeLevel, department, isActive, fullName, birthday, hireDate, yearsOfService, experienceYears } = await req.json()

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
