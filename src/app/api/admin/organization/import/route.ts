import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

export async function POST(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // [認証管理] 管理者以上のみ許可
    if (user.role !== 'DEVELOPER' && user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { items } = await req.json()
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const CORP_ID = user.corporationId || items[0]?.corporationId // SYSTEM_ADMIN の場合はデータ側の指定または初期値を考慮
    if (!CORP_ID) {
      return NextResponse.json({ error: 'Corporation ID is required' }, { status: 400 })
    }

    let results = {
      divisions: 0,
      facilities: 0,
      units: 0
    }

    // キャッシュ（1バッチ内での重複クエリを削減）
    const divisionCache = new Map<string, string>() // name -> id
    const facilityCache = new Map<string, string>() // "divId:facName" -> id

    for (const item of items) {
      const { divisionName, facilityName, unitName } = item

      // 1. Division (部門) の処理
      let divisionId: string | null = null
      if (divisionName) {
        if (divisionCache.has(divisionName)) {
          divisionId = divisionCache.get(divisionName)!
        } else {
          let div = await (prisma as any).division.findFirst({
            where: { name: divisionName, corporationId: CORP_ID }
          })
          if (!div) {
            div = await (prisma as any).division.create({
              data: { name: divisionName, corporationId: CORP_ID }
            })
            results.divisions++
          }
          divisionId = div.id
          divisionCache.set(divisionName, div.id)
        }
      }

      // 2. Facility (事業所) の処理
      let facilityId: string
      const facKey = `${divisionId || 'root'}:${facilityName}`
      if (facilityCache.has(facKey)) {
        facilityId = facilityCache.get(facKey)!
      } else {
        let fac = await (prisma as any).facility.findFirst({
          where: { 
            name: facilityName, 
            corporationId: CORP_ID,
            divisionId: divisionId
          }
        })
        if (!fac) {
          fac = await (prisma as any).facility.create({
            data: { 
              name: facilityName, 
              corporationId: CORP_ID,
              divisionId: divisionId
            }
          })
          results.facilities++
        }
        facilityId = fac.id
        facilityCache.set(facKey, fac.id)
      }

      // 3. Unit (ユニット) の処理
      if (unitName) {
        let unit = await (prisma as any).unit.findFirst({
          where: { name: unitName, facilityId: facilityId }
        })
        if (!unit) {
          await (prisma as any).unit.create({
            data: { name: unitName, facilityId: facilityId }
          })
          results.units++
        }
      }
    }

    return NextResponse.json({ 
      message: 'Import successful',
      results 
    })
  } catch (error) {
    console.error('Organization Import Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
