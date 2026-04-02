import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Supabase Admin クライアント取得関数（サーバーサイド専用）
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// 1. スタッフ一覧取得 (法人IDでフィルタリング)
export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      where: { corporationId: 'corp-001' }, // 暫定的に萌佑会のID固定
      orderBy: [{ department: 'asc' }, { fullName: 'asc' }],
      select: {
        id: true,
        staffId: true,
        email: true,
        fullName: true,
        role: true,
        gradeLevel: true,
        department: true,
        birthday: true,
        yearsOfService: true,
        experienceYears: true,
        welfarePoints: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      }
    })
    return NextResponse.json(staff)
  } catch (error) {
    console.error('GET /api/admin/staff error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}

// 2. スタッフ新規作成
export async function POST(req: Request) {
  try {
    const { 
      staffId, 
      email, 
      fullName, 
      role, 
      gradeLevel, 
      department,
      birthday,
      yearsOfService,
      experienceYears
    } = await req.json()
    
    // 法人IDはログインセッション等から取るべきだが、現在は萌佑会固定
    const corporationId = 'corp-001'

    const newUser = await prisma.user.create({
      data: {
        staffId,
        email: email || `${staffId}@moyuukai.local`,
        fullName,
        role,
        gradeLevel: gradeLevel || 1,
        department,
        birthday: birthday ? new Date(birthday) : null,
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
    const { id, role, gradeLevel, department, isActive, fullName, birthday, yearsOfService, experienceYears } = await req.json()

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(gradeLevel != null && { gradeLevel }),
        ...(department && { department }),
        ...(isActive != null && { isActive }),
        ...(fullName && { fullName }),
        ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
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
