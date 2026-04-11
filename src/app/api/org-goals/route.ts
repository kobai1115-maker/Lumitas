import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

// 1. 組織目標の階層構造を取得
export async function GET(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // フィルタ条件の構築
    const where: any = {
      corporationId: user.corporationId
    }

    // [権限管理] 法人管理者以外は、自施設（または自部門）に関連する目標のみ
    if (user.role !== 'ADMIN') {
      where.OR = [
        { facilityId: user.facilityId },
        { divisionId: user.divisionId },
        { level: 'CORPORATION' } // 法人全体の目標は全員見られる
      ]
    }

    const orgGoals = await (prisma.orgGoal as any).findMany({
      where,
      orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json(orgGoals)
  } catch (error) {
    console.error('GET /api/org-goals error:', error)
    return NextResponse.json({ error: '組織目標の取得に失敗しました' }, { status: 500 })
  }
}

// 組織目標の新規作成
export async function POST(req: Request) {
  try {
    const { user, error: authError } = await getServerAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { level, title, description, department, periodKey, parentId, facilityId: targetFacilityId } = await req.json()

    if (!level || !title || !description) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    // [権限管理] 法人管理者以外は法人目標を作成できない
    if (user.role !== 'ADMIN') {
      if (level === 'CORPORATION') {
        return NextResponse.json({ error: '法人目標の作成権限がありません' }, { status: 403 })
      }
      if (targetFacilityId && targetFacilityId !== user.facilityId) {
        return NextResponse.json({ error: '他施設の目標を作成する権限がありません' }, { status: 403 })
      }
    }

    const newGoal = await (prisma.orgGoal as any).create({
      data: {
        corporationId: user.corporationId,
        facilityId: targetFacilityId || user.facilityId,
        level,
        title,
        description,
        department: department || null,
        periodKey: periodKey || null,
        parentId: parentId || null,
        createdById: user.id,
      }
    })

    return NextResponse.json(newGoal)
  } catch (error) {
    console.error('POST /api/org-goals error:', error)
    return NextResponse.json({ error: '組織目標の作成に失敗しました' }, { status: 500 })
  }
}

// 組織目標の更新
export async function PATCH(req: Request) {
  try {
    const { id, title, description, department, periodKey } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 })
    }

    const updated = await prisma.orgGoal.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(department !== undefined && { department }),
        ...(periodKey !== undefined && { periodKey }),
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/org-goals error:', error)
    return NextResponse.json({ error: '組織目標の更新に失敗しました' }, { status: 500 })
  }
}
