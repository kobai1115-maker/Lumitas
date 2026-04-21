import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { randomUUID } from 'crypto'

// 1. 組織ツリーの取得
export async function GET(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 権限チェック：SYSTEM_ADMIN または ADMIN/MANAGER 以上
    if (!['DEVELOPER', 'MAIN_ADMIN', 'SUB_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // SYSTEM_ADMIN の場合はクエリパラメータから法人IDを取得可能にする
    const { searchParams } = new URL(req.url)
    const targetCorpId = (user.role === 'DEVELOPER' ? searchParams.get('corporationId') : null) || user.corporationId

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
    if (user.role !== 'DEVELOPER' && user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { items, type, name, parentId, corporationId: customCorpId } = body
    
    // 対象法人IDの決定
    const targetCorpId = (user.role === 'DEVELOPER' ? customCorpId : null) || user.corporationId
    if (!targetCorpId) {
      return NextResponse.json({ error: '法人IDが不明です' }, { status: 400 })
    }

    // 単体登録モード (手動追加)
    if (type && name) {
      switch (type) {
        case 'DIVISION':
          const newDiv = await prisma.division.create({
            data: { id: randomUUID(), name, corporationId: targetCorpId, updatedAt: new Date() }
          })
          return NextResponse.json({ success: true, item: newDiv })
        
        case 'FACILITY':
          // parentId は DivisionId (または null)
          const newFac = await prisma.facility.create({
            data: { 
              id: randomUUID(),
              name, 
              corporationId: targetCorpId,
              divisionId: parentId || null,
              updatedAt: new Date()
            }
          })
          return NextResponse.json({ success: true, item: newFac })
        
        case 'UNIT':
          // parentId は FacilityId (必須)
          if (!parentId) return NextResponse.json({ error: '施設IDが必要です' }, { status: 400 })
          const newUnit = await prisma.unit.create({
            data: { id: randomUUID(), name, facilityId: parentId, updatedAt: new Date() }
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
            data: { id: randomUUID(), name: divisionName, corporationId: targetCorpId, updatedAt: new Date() }
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
            id: randomUUID(),
            name: facilityName, 
            corporationId: targetCorpId, 
            divisionId: currentDivisionId,
            updatedAt: new Date() 
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
            data: { id: randomUUID(), name: unitName, facilityId: currentFacilityId, updatedAt: new Date() }
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

// 3. 組織アイテムの編集
export async function PATCH(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'DEVELOPER' && user.role !== 'MAIN_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { type, id, name } = await req.json()
    if (!type || !id || !name) return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })

    switch (type) {
      case 'DIVISION':
        await prisma.division.update({ where: { id }, data: { name, updatedAt: new Date() } })
        break
      case 'FACILITY':
        await prisma.facility.update({ where: { id }, data: { name, updatedAt: new Date() } })
        break
      case 'UNIT':
        await prisma.unit.update({ where: { id }, data: { name, updatedAt: new Date() } })
        break
      default:
        return NextResponse.json({ error: '無効な種別です' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/admin/organization error:', error)
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }
}

// 4. 組織アイテムの削除
export async function DELETE(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'DEVELOPER' && user.role !== 'MAIN_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })

    switch (type) {
      case 'DIVISION':
        await prisma.division.delete({ where: { id } })
        break
      case 'FACILITY':
        await prisma.facility.delete({ where: { id } })
        break
      case 'UNIT':
        await prisma.unit.delete({ where: { id } })
        break
      default:
        return NextResponse.json({ error: '無効な種別です' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/organization error:', error)
    // 外部キー制約等のエラーハンドリング
    return NextResponse.json({ error: '削除に失敗しました（関連するデータが存在する可能性があります）' }, { status: 500 })
  }
}
