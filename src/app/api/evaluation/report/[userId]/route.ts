import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { user: currentUser, error: authError } = await getServerAuthUser()
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.userId

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

    // デモ用データ（本来的にはPrismaで集計）
    const demoStaffList: Record<string, any> = {
      'u1': { fullName: '小林 洋貴', position: '管理者', dept: '管理部', grade: 6, comment: '多角的な視点から施設全体のマネジメントを完遂。特にDX推進において顕著なリーダーシップを発揮しました。' },
      'u2': { fullName: '山田 里美', position: '副管理者', dept: '管理部', grade: 5, comment: '各部署間の連携を円滑にし、待機者解消に大きく貢献。現場スタッフのメンタルケアにおいても高い評価を得ています。' },
      'u3': { fullName: '斉藤 課長', position: '介護課長', dept: '介護課', grade: 5, comment: '専門性の高いケアの標準化に成功しています。部下の育成にも定評があり、次世代のリーダー候補が着実に育っています。' },
      'u4': { fullName: '田中 主任', position: '介護主任', dept: '介護課', grade: 4, comment: '現場のオペレーション改善において顕著な成果を上げています。特に事故防止の取り組みは他部署の模範となっています。' },
      'u5': { fullName: '鈴木 太郎', position: '一般職', dept: '介護課', grade: 2, comment: '利用者様一人ひとりに寄り添ったケアが非常に高く評価されています。チーム内でのムードメーカーでもあり、周囲への好影響が見られます。' }
    }

    const targetDemo = demoStaffList[userId] || demoStaffList['u1']

    return NextResponse.json({
      staff: {
        fullName: targetDemo.fullName,
        positionName: targetDemo.position,
        departmentName: targetDemo.dept,
        gradeLevel: targetDemo.grade,
        lastOneOnOneDate: '2026/03/25'
      },
      metrics: {
        achievement: 85 + Math.floor(Math.random() * 5),
        competency: 82 + Math.floor(Math.random() * 8),
        sentiment: 92 + Math.floor(Math.random() * 4),
        skills: 80 + Math.floor(Math.random() * 10),
        team: 88 + Math.floor(Math.random() * 6)
      },
      aiComment: targetDemo.comment,
      corpName: '社会福祉法人 萌佑会',
      locationName: '特別養護老人ホーム ルミタス'
    })

  } catch (error) {
    console.error('GET /api/evaluation/report error:', error)
    return NextResponse.json({ error: 'Failed to access report data' }, { status: 500 })
  }
}
