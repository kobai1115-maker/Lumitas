import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 1. 組織目標の階層構造を取得 (社会福祉法人 萌佑会用モック含む)
export async function GET() {
  try {
    const orgGoals = await prisma.orgGoal.findMany({
      where: { corporationId: 'corp-001' },
      orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
    })

    // 階層化して整理 (本来は再帰的に処理)
    return NextResponse.json(orgGoals)
  } catch (error) {
    console.error('GET /api/org-goals error:', error)
    
    // DBがまだ準備できていない場合のデモ用フォールバック
    const mockGoals = [
      {
        id: 'mock-1',
        level: 'CORPORATION',
        title: '【中核目標】地域に根ざした最高品質の介護サービスの提供',
        description: '2026年までに、全スタッフがAIツールを使いこなし、利用者様との時間を20%増加させる',
        department: '法人全体',
        children: [],
        createdBy: { fullName: 'AXLINK管理者' },
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-2',
        level: 'FACILITY',
        title: '【ルミタス】IT活用によるケアの質向上と事故ゼロの両立',
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
        corporationId: 'corp-001',
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
