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
    console.error('GET /api/org-goals error:', error)
    return NextResponse.json({ error: '組織目標の取得に失敗しました' }, { status: 500 })
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
