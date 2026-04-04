import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'



// 研修参加記録の取得
export async function GET(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('userId') || user.id

    // [権限管理] 他人のデータ閲覧チェック
    if (targetUserId !== user.id && user.role !== 'ADMIN') {
      if (user.role === 'MANAGER') {
        const targetUser = await (prisma.user as any).findFirst({
          where: { id: targetUserId, corporationId: user.corporationId, facilityId: user.facilityId }
        })
        if (!targetUser) {
          return NextResponse.json({ error: '他施設の職員の研修記録は閲覧できません' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: '自分の研修記録以外の閲覧は禁止されています' }, { status: 403 })
      }
    }

    const records = await (prisma.trainingRecord as any).findMany({
      where: { userId: targetUserId, corporationId: user.corporationId },
      include: {
        user: { select: { fullName: true, department: true, staffId: true } },
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
    const { user: currentUser, error: authError } = await getServerAuthUser()
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId: requestedUserId, title, type, date, hours, reportContent, imageUrl, isLecturer } = await req.json()
    const targetUserId = requestedUserId || currentUser.id

    if (!targetUserId || !title || !type || !date || !hours) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    // [権限管理] 登録権限チェック
    if (targetUserId !== currentUser.id && currentUser.role !== 'ADMIN') {
      if (currentUser.role === 'MANAGER') {
        const targetUser = await (prisma.user as any).findFirst({
          where: { id: targetUserId, corporationId: currentUser.corporationId, facilityId: currentUser.facilityId }
        })
        if (!targetUser) {
          return NextResponse.json({ error: '他施設の職員の研修記録を登録する権限がありません' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: '自分以外の研修記録を登録する権限がありません' }, { status: 403 })
      }
    }

    // ポイント設定... (略)
    let earnedPoints = 5
    if (type === 'PRO_ORG_OFFICER') {
      earnedPoints = 30
    } else if (type === 'OFF_JT' || type === 'BOOK') {
      earnedPoints = isLecturer ? 30 : 10
    } else {
      earnedPoints = isLecturer ? 20 : 5
    }

    // 1. 研修記録を作成
    const record = await (prisma.trainingRecord as any).create({
      data: {
        corporationId: currentUser.corporationId,
        facilityId: currentUser.facilityId, // 現在の所属施設をセット
        userId: targetUserId,
        title,
        type,
        date: new Date(date),
        hours: parseFloat(hours),
        reportContent: reportContent || null,
        earnedPoints,
        isLecturer: !!isLecturer,
        pointsGranted: false,
        imageUrl: imageUrl || null,
      }
    })

    // 2. 本人にポイント付与（二重付与防止）
    if (!record.pointsGranted) {
      await (prisma.user as any).update({
        where: { id: targetUserId },
        data: { welfarePoints: { increment: record.earnedPoints } }
      })

      // 付与済みフラグを立てる
      await (prisma.trainingRecord as any).update({
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
