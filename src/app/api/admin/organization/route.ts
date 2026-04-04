import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const CORP_ID = 'corp-001' // 暫定固定

// 1. 組織ツリーの取得
export async function GET() {
  try {
    // 法人 ＞ 部 ＞ 事業所 ＞ ユニット の親子関係をすべてインクルード
    const corporation = await prisma.corporation.findUnique({
      where: { id: CORP_ID },
      include: {
        divisions: {
          include: {
            facilities: {
              include: {
                units: true
              }
            }
          }
        },
        facilities: {
          where: { divisionId: null }, // 部門に属さない事業所
          include: {
            units: true
          }
        }
      }
    })

    if (!corporation) {
      return NextResponse.json({ error: '法人が見つかりません' }, { status: 404 })
    }

    return NextResponse.json(corporation)
  } catch (error) {
    console.error('GET /api/admin/organization error:', error)
    return NextResponse.json({ error: '組織データの取得に失敗しました' }, { status: 500 })
  }
}

// 2. 組織データの一括登録・更新 (Excelインポート対応)
export async function POST(req: Request) {
  try {
    const { items } = await req.json()
    // items: Array<{ divisionName: string, facilityName: string, unitName: string }>
    
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: '無効なデータ形式です' }, { status: 400 })
    }

    console.log(`📦 ${items.length} 件の組織データを処理します...`)

    // 大がかりな変更のため、一件ずつ丁寧に整合性をチェックしながら作成/更新
    const results = {
      divisions: 0,
      facilities: 0,
      units: 0
    }

    for (const item of items) {
      const { divisionName, facilityName, unitName } = item
      if (!facilityName) continue

      // 1. 部門 (Division)
      let currentDivisionId: string | null = null
      if (divisionName) {
        const existingDiv = await prisma.division.findFirst({
          where: { name: divisionName, corporationId: CORP_ID }
        })
        if (existingDiv) {
          currentDivisionId = existingDiv.id
        } else {
          const newDiv = await prisma.division.create({
            data: { name: divisionName, corporationId: CORP_ID }
          })
          currentDivisionId = newDiv.id
          results.divisions++
        }
      }

      // 2. 事業所 (Facility)
      let currentFacilityId: string | null = null
      const existingFac = await prisma.facility.findFirst({
        where: { name: facilityName, corporationId: CORP_ID, divisionId: currentDivisionId }
      })
      if (existingFac) {
        currentFacilityId = existingFac.id
        // 部門の紐付けが変わっている可能性を考慮して更新
        await prisma.facility.update({
          where: { id: currentFacilityId },
          data: { divisionId: currentDivisionId }
        })
      } else {
        const newFac = await prisma.facility.create({
          data: { 
            name: facilityName, 
            corporationId: CORP_ID, 
            divisionId: currentDivisionId 
          }
        })
        currentFacilityId = newFac.id
        results.facilities++
      }

      // 3. ユニット (Unit)
      if (unitName && currentFacilityId) {
        const existingUnit = await prisma.unit.findFirst({
          where: { name: unitName, facilityId: currentFacilityId }
        })
        if (!existingUnit) {
          await prisma.unit.create({
            data: { name: unitName, facilityId: currentFacilityId }
          })
          results.units++
        }
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('POST /api/admin/organization error:', error)
    return NextResponse.json({ error: '組織データの更新に失敗しました' }, { status: 500 })
  }
}
