import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

// 1. 組織ツリーの取得
export async function GET(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 権限チェック：SYSTEM_ADMIN または ADMIN/MANAGER 以上
    if (!['SYSTEM_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // SYSTEM_ADMIN の場合はクエリパラメータから法人IDを取得可能にする
    const { searchParams } = new URL(req.url)
    const targetCorpId = (user.role === 'SYSTEM_ADMIN' ? searchParams.get('corporationId') : null) || user.corporationId

    if (!targetCorpId) {
      return NextResponse.json({ error: '法人IDが指定されていません' }, { status: 400 })
    }

    // 法人 ＞ 部 ＞ 事業所 ＞ ユニット の親子関係をすべてインクルード
    const corporation = await prisma.corporation.findUnique({
      where: { id: targetCorpId },
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
    const { user, error } = await getServerAuthUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 管理権限チェック
    if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { items, type, name, parentId, corporationId: customCorpId } = body
    
    // 対象法人IDの決定
    const targetCorpId = (user.role === 'SYSTEM_ADMIN' ? customCorpId : null) || user.corporationId
    if (!targetCorpId) {
      return NextResponse.json({ error: '法人IDが不明です' }, { status: 400 })
    }

    // 単体登録モード (手動追加)
    if (type && name) {
      switch (type) {
        case 'DIVISION':
          const newDiv = await prisma.division.create({
            data: { name, corporationId: targetCorpId }
          })
          return NextResponse.json({ success: true, item: newDiv })
        
        case 'FACILITY':
          // parentId は DivisionId (または null)
          const newFac = await prisma.facility.create({
            data: { 
              name, 
              corporationId: targetCorpId,
              divisionId: parentId || null
            }
          })
          return NextResponse.json({ success: true, item: newFac })
        
        case 'UNIT':
          // parentId は FacilityId (必須)
          if (!parentId) return NextResponse.json({ error: '施設IDが必要です' }, { status: 400 })
          const newUnit = await prisma.unit.create({
            data: { name, facilityId: parentId }
          })
          return NextResponse.json({ success: true, item: newUnit })
        
        default:
          return NextResponse.json({ error: '無効な種別です' }, { status: 400 })
      }
    }

    // 一括登録モード (Excelインポート)
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: '無効なデータ形式です' }, { status: 400 })
    }

    console.log(`📦 法人 ${targetCorpId} の組織データ ${items.length} 件を処理します...`)

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
          where: { name: divisionName, corporationId: targetCorpId }
        })
        if (existingDiv) {
          currentDivisionId = existingDiv.id
        } else {
          const newDiv = await prisma.division.create({
            data: { name: divisionName, corporationId: targetCorpId }
          })
          currentDivisionId = newDiv.id
          results.divisions++
        }
      }

      // 2. 事業所 (Facility)
      let currentFacilityId: string | null = null
      const existingFac = await prisma.facility.findFirst({
        where: { name: facilityName, corporationId: targetCorpId, divisionId: currentDivisionId }
      })
      if (existingFac) {
        currentFacilityId = existingFac.id
        await prisma.facility.update({
          where: { id: currentFacilityId },
          data: { divisionId: currentDivisionId }
        })
      } else {
        const newFac = await prisma.facility.create({
          data: { 
            name: facilityName, 
            corporationId: targetCorpId, 
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
