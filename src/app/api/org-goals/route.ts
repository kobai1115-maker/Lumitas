import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 組織目標一覧取得（階層構造で返す）
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const level = searchParams.get('level')

    const orgGoals = await prisma.orgGoal.findMany({
      where: level ? { level: level as 'MISSION' | 'CORPORATE' | 'DEPARTMENT' } : undefined,
      include: {
        children: true,
        createdBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(orgGoals)
  } catch (error) {
    console.error('GET /api/org-goals error (Serving mock data for demo):', error)
    
    // DB未接続時のためのデモ用ダミーデータ
    const mockGoals = [
      {
        id: 'mock-1',
        level: 'MISSION',
        title: '地域で一番愛される福祉拠点',
        description: '利用者様一人ひとりの尊厳を、私たちの最大の喜びとする',
        department: null,
        children: [
          { id: 'mock-2', title: '個別ケアの徹底', level: 'CORPORATE' },
          { id: 'mock-3', title: '地域交流イベントの月1回開催', level: 'CORPORATE' }
        ],
        createdBy: { fullName: 'AXLINK管理者' },
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-4',
        level: 'DEPARTMENT',
        title: '現場DXの推進',
        description: '音声入力（ルミタス）を活用し、記録時間を1日30分削減する',
        department: '介護部',
        children: [],
        createdBy: { fullName: 'AXLINK管理者' },
        createdAt: new Date().toISOString()
      }
    ]
    return NextResponse.json(mockGoals)
  }
}

// 組織目標の新規作成
export async function POST(req: Request) {
  try {
    const { level, title, description, department, periodKey, parentId } = await req.json()

    if (!level || !title || !description) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    const newGoal = await prisma.orgGoal.create({
      data: {
        level,
        title,
        description,
        department: department || null,
        periodKey: periodKey || null,
        parentId: parentId || null,
        createdById: 'demo-admin-id', // セッションから取得予定
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
