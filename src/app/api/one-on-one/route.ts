import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 1on1面談記録の取得
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    const notes = await prisma.oneOnOneNote.findMany({
      where: {
        OR: [{ employeeId: userId }, { managerId: userId }]
      },
      include: {
        employee: { select: { fullName: true, department: true } },
        manager: { select: { fullName: true } },
      },
      orderBy: { meetingDate: 'desc' }
    })
    return NextResponse.json(notes)
  } catch (error) {
    console.error('GET /api/one-on-one error:', error)
    return NextResponse.json({ error: '面談記録の取得に失敗しました' }, { status: 500 })
  }
}

// 1on1面談記録の保存＋ポイント付与
export async function POST(req: Request) {
  try {
    const { employeeId, managerId, content, aiActionItems, meetingDate } = await req.json()

    if (!employeeId || !managerId || !content || !meetingDate) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    // 1. 面談記録を保存
    const note = await prisma.oneOnOneNote.create({
      data: {
        employeeId,
        managerId,
        content,
        aiActionItems: aiActionItems || null,
        meetingDate: new Date(meetingDate),
        employeePoints: 5,
        managerPoints: 3,
        pointsGranted: false,
      }
    })

    // 2. 両者へのポイント付与（二重付与防止チェック付き）
    if (!note.pointsGranted) {
      await Promise.all([
        // 受講者（employee）に5ポイント付与
        prisma.user.update({
          where: { id: employeeId },
          data: { welfarePoints: { increment: note.employeePoints } }
        }),
        // 実施者（manager）に3ポイント付与
        prisma.user.update({
          where: { id: managerId },
          data: { welfarePoints: { increment: note.managerPoints } }
        }),
        // 付与済みフラグを立てる
        prisma.oneOnOneNote.update({
          where: { id: note.id },
          data: { pointsGranted: true }
        })
      ])
    }

    return NextResponse.json({
      success: true,
      note,
      pointsGranted: {
        employee: note.employeePoints,
        manager: note.managerPoints
      }
    })
  } catch (error) {
    console.error('POST /api/one-on-one error:', error)
    return NextResponse.json({ error: '面談記録の保存に失敗しました' }, { status: 500 })
  }
}
