import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


import { createClient } from '@supabase/supabase-js'

// Supabase Admin 繧ｯ繝ｩ繧､繧｢繝ｳ繝亥叙蠕鈴未謨ｰ・医し繝ｼ繝舌・繧ｵ繧､繝牙ｰら畑・・function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// 1. 繧ｹ繧ｿ繝・ヵ荳隕ｧ蜿門ｾ・(豕穂ｺｺID縺ｧ繝輔ぅ繝ｫ繧ｿ繝ｪ繝ｳ繧ｰ)
export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      where: { corporationId: 'corp-001' }, // 證ｫ螳夂噪縺ｫ關御ｽ台ｼ壹・ID蝗ｺ螳・      orderBy: [{ department: 'asc' }, { fullName: 'asc' }],
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
    return NextResponse.json({ error: '蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆' }, { status: 500 })
  }
}

// 2. 繧ｹ繧ｿ繝・ヵ譁ｰ隕丈ｽ懈・
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
    
    // 豕穂ｺｺID縺ｯ繝ｭ繧ｰ繧､繝ｳ繧ｻ繝・す繝ｧ繝ｳ遲峨°繧牙叙繧九∋縺阪□縺後∫樟蝨ｨ縺ｯ關御ｽ台ｼ壼崋螳・    const corporationId = 'corp-001'

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
    return NextResponse.json({ error: '菴懈・縺ｫ螟ｱ謨励＠縺ｾ縺励◆' }, { status: 500 })
  }
}

// 3. 繧ｹ繧ｿ繝・ヵ諠・ｱ譖ｴ譁ｰ
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
    return NextResponse.json({ error: '譖ｴ譁ｰ縺ｫ螟ｱ謨励＠縺ｾ縺励◆' }, { status: 500 })
  }
}
