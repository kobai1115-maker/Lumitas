import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { user: currentUser, error: authError } = await getServerAuthUser()
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // [権限管理] 他人の評価レポート閲覧チェック
    if (userId !== currentUser.id && currentUser.role !== 'ADMIN') {
      if (currentUser.role === 'MANAGER') {
        const targetUser = await (prisma.user as any).findFirst({
          where: { id: userId, corporationId: currentUser.corporationId, facilityId: currentUser.facilityId }
        })
        if (!targetUser) {
          return NextResponse.json({ error: '他施設の職員の評価情報は閲覧できません' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: '自分の評価情報以外の閲覧は禁止されています' }, { status: 403 })
      }
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        corporation: true,
        facility: true,
        position: true,
      }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      staff: {
        fullName: targetUser.fullName,
        positionName: targetUser.position?.name || '一般職',
        departmentName: targetUser.department || '未設定',
        gradeLevel: targetUser.gradeLevel,
        lastOneOnOneDate: '直近なし' // ここは将来的にOneOnOneNoteから最新日を取得するように拡張可能
      },
      metrics: {
        achievement: 80, // 将来的にEvaluationモデルから集計
        competency: 75,
        sentiment: 85,
        skills: 70,
        team: 80
      },
      aiComment: `${targetUser.fullName}さんは、${targetUser.department}の一員として誠実に業務に励んでいます。`,
      corpName: targetUser.corporation?.name || '社会福祉法人 萌佑会',
      locationName: targetUser.facility?.name || '拠点未設定'
    })

  } catch (error) {
    console.error('GET /api/evaluation/report error:', error)
    return NextResponse.json({ error: 'Failed to access report data' }, { status: 500 })
  }
}
