import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { Role } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

// Supabase Admin クライアント取得関数（サーバーサイド専用）
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// 日本語役職名から Role Enum へのマッピング
const ROLE_MAP: Record<string, Role> = {
  '法人管理者': 'MAIN_ADMIN',
  '施設長': 'SUB_ADMIN',
  '介護職': 'GENERAL',
  '看護職': 'GENERAL',
  '事務職': 'GENERAL',
  '生活相談員': 'GENERAL',
  '主任': 'GENERAL',
  '副主任': 'GENERAL',
  'リーダー': 'GENERAL',
  '一般職': 'GENERAL',
  'その他': 'GENERAL'
}

export async function POST(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // [権限管理] 管理者以上のみ
    if (user.role !== 'DEVELOPER' && user.role !== 'MAIN_ADMIN') {
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

    const supabaseAdmin = getSupabaseAdmin()
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
        const { staffId, fullName, fullNameKana, email, roleName, facilityName, unitName, gradeLevel, department } = item

        if (!staffId || !email) {
          results.errors++
          continue
        }

        const sid = String(staffId)

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
        const role = ROLE_MAP[roleName] || 'GENERAL'

        // 4. Upsert (職員IDで一意に特定)
        const existingUser = await (prisma as any).user.findUnique({
          where: { staffId: sid }
        })

        if (existingUser) {
          // 更新 (異動・昇進・降格)
          await (prisma as any).user.update({
            where: { staffId: sid },
            data: {
              fullName,
              fullNameKana,
              email,
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
          // 新規作成: まず Supabase Auth ユーザーを作成
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: 'CareGrow2026',
            email_confirm: true,
            user_metadata: {
              staffId: sid,
              fullName,
              role
            }
          })

          if (authError) {
            console.error(`Auth creation failed for ${sid}:`, authError.message)
            results.errors++
            continue
          }

          const supabaseUserId = authData.user.id

          try {
            // Prisma に登録
            await (prisma as any).user.create({
              data: {
                id: supabaseUserId,
                staffId: sid,
                fullName,
                fullNameKana,
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
          } catch (err) {
            console.error(`Prisma creation failed for ${sid}, rolling back auth:`, err)
            await supabaseAdmin.auth.admin.deleteUser(supabaseUserId)
            results.errors++
          }
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
