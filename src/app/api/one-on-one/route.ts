import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser, canAccessTargetUser } from '@/lib/auth-server'

// 1on1面談記録の一覧取得
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

    // [権限管理] 
    if (user.role === 'MAIN_ADMIN') {
      // 法人管理者は制限なし
    } else if (user.role === 'SUB_ADMIN') {
      // 施設長は、自施設内の全記録
      where.facilityId = user.facilityId
    } else {
      // 一般職は、自分自身が関わる記録のみ (OR条件)
      where.OR = [
        { employeeId: user.id },
        { managerId: user.id }
      ]
    }

    const notes = await prisma.oneOnOneNote.findMany({
      where,
      orderBy: { meetingDate: 'desc' },
      include: {
        User_OneOnOneNote_employeeIdToUser: { select: { fullName: true, department: true, staffId: true } },
        User_OneOnOneNote_managerIdToUser: { select: { fullName: true, staffId: true } }
      }
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
    const { user: currentUser, error: authError } = await getServerAuthUser()
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { employeeId, managerId: requestedManagerId, content, aiActionItems, meetingDate } = await req.json()

    if (!employeeId || !requestedManagerId || !content || !meetingDate) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    // [権限管理] 実施者（マネージャー）の検証
    const actualManagerId = (currentUser.role === 'MAIN_ADMIN') ? requestedManagerId : currentUser.id;

    // [権限管理] 対象受講者へのアクセス権限チェック
    const hasAccess = await canAccessTargetUser(currentUser, employeeId)
    if (!hasAccess) {
      return NextResponse.json({ error: '対象の職員の面談記録を作成する権限がありません' }, { status: 403 })
    }

    // 1. 面談記録を保存
    const note = await (prisma.oneOnOneNote as any).create({
      data: {
        corporationId: currentUser.corporationId,
        facilityId: currentUser.facilityId, // マネージャーの所属施設をセット
        employeeId,
        managerId: actualManagerId,
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
          where: { id: actualManagerId },
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
