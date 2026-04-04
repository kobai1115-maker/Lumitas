import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { analyzeGoalAlignment } from '@/lib/ai-goal-validator'

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
        const targetUser = await prisma.user.findFirst({
          // @ts-ignore
          where: { id: targetUserId, corporationId: user.corporationId, facilityId: user.facilityId }
        })
        if (!targetUser) {
          return NextResponse.json({ error: '他施設の職員の目標は閲覧できません' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: '自分の目標以外の閲覧は禁止されています' }, { status: 403 })
      }
    }

    const goals = await (prisma.goal as any).findMany({ 
      where: { userId: targetUserId, corporationId: user.corporationId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(goals)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { user, error: authError } = await getServerAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const targetUserId = body.userId || user.id

    // [権限管理] 目標作成権限チェック
    if (targetUserId !== user.id && user.role !== 'ADMIN') {
      if (user.role === 'MANAGER') {
        const targetUser = await prisma.user.findFirst({
          // @ts-ignore
          where: { id: targetUserId, corporationId: user.corporationId, facilityId: user.facilityId }
        })
        if (!targetUser) {
          return NextResponse.json({ error: '他施設の職員に目標を設定する権限がありません' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: '自分以外の目標を設定する権限がありません' }, { status: 403 })
      }
    }

    // 作成する目標に facilityId を紐付ける
    const targetUserRecord = await prisma.user.findUnique({ where: { id: targetUserId } })

    // 目標の階層カテゴリ (DAILY, EVENT, YEARLY)
    const category = body.type || 'YEARLY'

    // [NEW] 理念・事業目標との連動診断 (AI)
    let aiAlignmentNote = null
    try {
      aiAlignmentNote = await analyzeGoalAlignment(
        user.corporationId,
        body.title,
        category
      )
    } catch (e) {
      console.error('AI Alignment Analysis failed:', e)
    }

    const newGoal = await prisma.goal.create({
      data: {
        corporationId: user.corporationId,
        // @ts-ignore
        facilityId: targetUserRecord?.facilityId || user.facilityId,
        userId: targetUserId,
        title: body.title,
        // @ts-ignore
        type: category,
        targetValue: body.targetValue,
        currentValue: body.currentValue || 0,
        unit: body.unit,
        // @ts-ignore
        deadline: body.deadline ? new Date(body.deadline) : null,
        // @ts-ignore
        aiAlignmentNote: aiAlignmentNote,
        periodKey: body.periodKey || '2026-H1',
        isAchieved: body.isAchieved || false
      }
    })
    return NextResponse.json(newGoal)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, error: authError } = await getServerAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, title, targetValue, unit, deadline, type, currentValue, isAchieved } = body

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    // [NEW] タイトルやタイプが変わった場合に AI 診断をやり直す
    let aiAlignmentNote = undefined
    if (title || type) {
      try {
        aiAlignmentNote = await analyzeGoalAlignment(
          user.corporationId,
          title || '',
          type || 'YEARLY'
        )
      } catch (e) {
        console.error('AI Alignment Re-analysis failed:', e)
      }
    }

    const updatedGoal = await (prisma.goal as any).update({
      where: { 
        id,
        corporationId: user.corporationId // セキュリティ: 自法人のデータのみ
      },
      data: {
        title: title || undefined,
        targetValue: targetValue !== undefined ? targetValue : undefined,
        unit: unit || undefined,
        // @ts-ignore
        deadline: deadline ? new Date(deadline) : (deadline === null ? null : undefined),
        // @ts-ignore
        type: type || undefined,
        // @ts-ignore
        aiAlignmentNote: aiAlignmentNote || undefined,
        currentValue: currentValue !== undefined ? currentValue : undefined,
        isAchieved: isAchieved !== undefined ? isAchieved : undefined
      }
    })

    return NextResponse.json(updatedGoal)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}
