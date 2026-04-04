import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { Role } from '@prisma/client'

// 日本語役職名から Role Enum へのマッピング
const ROLE_MAP: Record<string, Role> = {
  '法人管理者': 'ADMIN',
  '施設長': 'MANAGER',
  '介護職': 'STAFF_CAREGIVER',
  '看護職': 'STAFF_NURSE',
  '事務職': 'STAFF_OFFICE',
  '生活相談員': 'STAFF_SOCIAL_WORKER',
  'その他': 'STAFF_OTHER'
}

export async function POST(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // [権限管理] 管理者以上のみ
    if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { items } = await req.json()
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const CORP_ID = user.corporationId || items[0]?.corporationId
    if (!CORP_ID) {
      return NextResponse.json({ error: 'Corporation ID is required' }, { status: 400 })
    }

    let results = {
      created: 0,
      updated: 0,
      errors: 0
    }

    // ID解決用のキャッシュ
    const facilityCache = new Map<string, string>() // name -> id
    const unitCache = new Map<string, string>() // "facId:unitName" -> id

    for (const item of items) {
      try {
        const { staffId, fullName, email, roleName, facilityName, unitName, gradeLevel, department } = item

        if (!staffId || !email) {
          results.errors++
          continue
        }

        // 1. 施設の特定
        let facilityId: string | null = null
        if (facilityName) {
          if (facilityCache.has(facilityName)) {
            facilityId = facilityCache.get(facilityName)!
          } else {
            const fac = await (prisma as any).facility.findFirst({
              where: { name: facilityName, corporationId: CORP_ID }
            })
            if (fac) {
              facilityId = fac.id
              facilityCache.set(facilityName, fac.id)
            }
          }
        }

        // 2. ユニットの特定
        let unitId: string | null = null
        if (unitName && facilityId) {
          const unitKey = `${facilityId}:${unitName}`
          if (unitCache.has(unitKey)) {
            unitId = unitCache.get(unitKey)!
          } else {
            const unit = await (prisma as any).unit.findFirst({
              where: { name: unitName, facilityId: facilityId }
            })
            if (unit) {
              unitId = unit.id
              unitCache.set(unitKey, unit.id)
            }
          }
        }

        // 3. 役職の変換
        const role = ROLE_MAP[roleName] || 'STAFF_CAREGIVER'

        // 4. Upsert (職員IDで一意に特定)
        const existingUser = await (prisma as any).user.findUnique({
          where: { staffId: String(staffId) }
        })

        if (existingUser) {
          // 更新 (異動・昇進・降格)
          await (prisma as any).user.update({
            where: { staffId: String(staffId) },
            data: {
              fullName,
              email,          // メールアドレスも更新対象 (要件に応じて)
              role,
              gradeLevel: Number(gradeLevel) || 1,
              department: department || '介護課',
              facilityId,
              unitId,
              corporationId: CORP_ID
            }
          })
          results.updated++
        } else {
          // 新規作成
          await (prisma as any).user.create({
            data: {
              staffId: String(staffId),
              fullName,
              email,
              role,
              gradeLevel: Number(gradeLevel) || 1,
              department: department || '介護課',
              facilityId,
              unitId,
              corporationId: CORP_ID,
              mustChangePassword: true
            }
          })
          results.created++
        }
      } catch (err) {
        console.error('Row import error:', err)
        results.errors++
      }
    }

    return NextResponse.json({ 
      message: 'Staff import completed',
      results 
    })
  } catch (error) {
    console.error('Staff Import API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
