import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'



// 研修参加記録の取得
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    const records = await prisma.trainingRecord.findMany({
      where: { userId },
      include: {
        user: { select: { fullName: true, department: true } },
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(records)
  } catch (error) {
    console.error('GET /api/training error:', error)
    return NextResponse.json({ error: '研修記録の取得に失敗しました' }, { status: 500 })
  }
}

// 研修記録の保存・ポイント付与
export async function POST(req: Request) {
  try {
    const { userId, title, type, date, hours, reportContent, imageUrl } = await req.json()

    if (!userId || !title || !type || !date || !hours) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    // OJT/OffJTによるポイント設定（仮のロジック: OJT 5pt, OFF_JT 10pt）
    const earnedPoints = type === 'OFF_JT' || type === 'BOOK' ? 10 : 5

    // 1. 研修記録を作成
    const record = await prisma.trainingRecord.create({
      data: {
        corporationId: 'corp-001',
        userId,
        title,
        type,
        date: new Date(date),
        hours: parseFloat(hours),
        reportContent: reportContent || null,
        earnedPoints,
        pointsGranted: false,
        imageUrl: imageUrl || null,
      }
    })

    // 2. 本人にポイント付与（二重付与防止）
    if (!record.pointsGranted) {
      await prisma.user.update({
        where: { id: userId },
        data: { welfarePoints: { increment: record.earnedPoints } }
      })

      // 付与済みフラグを立てる
      await prisma.trainingRecord.update({
        where: { id: record.id },
        data: { pointsGranted: true }
      })
    }

    return NextResponse.json({
      success: true,
      record,
      pointsGranted: record.earnedPoints
    })
  } catch (error) {
    console.error('POST /api/training error:', error)
    return NextResponse.json({ error: '研修記録の保存に失敗しました' }, { status: 500 })
  }
}
