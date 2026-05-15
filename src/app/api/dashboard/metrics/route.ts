import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { calculateTotalScore } from '@/lib/scoring'
import { DashboardMetrics } from '@/types'

/**
 * ダッシュボード用のリアルタイム・メトリクスとスコアを算出するAPI
 */
export async function GET(request: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fiscalYear = searchParams.get('year') || '2026'
    const periodKey = fiscalYear // シンプルに年度をキーとする

    // 1. 目標 (Goals) 取得
    // 注: 実際には半期(H1/H2)などの指定が必要かもしれないが、現在は年度単位
    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id,
        periodKey: periodKey
      }
    })

    // 達成率の計算 (完了した目標の割合)
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.isAchieved).length
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
    
    // MBO達成スコアとして使用
    const achievementScore = Math.min(100, completionRate)

    // 2. ピアボーナス (Peer Bonus) 取得
    // 指定年度の範囲内でカウント
    const startDate = new Date(`${fiscalYear}-04-01T00:00:00Z`)
    const endDate = new Date(`${Number(fiscalYear) + 1}-03-31T23:59:59Z`)

    const receivedBonusesCount = await prisma.peerBonus.count({
      where: {
        receiverId: user.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // 3. インシデント報告 (Incident Reports) 取得
    const incidentReports = await prisma.incidentReport.findMany({
      where: {
        reporterId: user.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // 4. コンピテンシー評価 (Evaluation) 取得
    // 直近の確定済み評価、または進行中の下書きから取得
    const evaluation = await prisma.evaluation.findFirst({
      where: {
        employeeId: user.id,
        periodKey: periodKey
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // コンピテンシー平均値（DBに保存されている値、なければデフォルト3.0）
    const competencyAvg = evaluation?.competencyScore || 3.0

    // スコア計算ロジック実行
    const scoreData = calculateTotalScore(
      achievementScore,
      competencyAvg,
      receivedBonusesCount,
      incidentReports
    )

    // 職種別ダッシュボードに表示するメトリクスの構築
    const metrics: DashboardMetrics = {
      completionRate: Math.round(completionRate),
      incidentReports: incidentReports.length,
      skillLevel: Math.round(competencyAvg),
      // 他のメトリクス（服薬エラーゼロ日数など）は将来的に集計ロジックを追加
    }

    return NextResponse.json({
      fiscalYear,
      metrics,
      scoreData,
      debug: {
        goalsCount: totalGoals,
        bonusesCount: receivedBonusesCount,
        incidentsCount: incidentReports.length
      }
    })
  } catch (err) {
    console.error('Dashboard metrics API error:', err)
    return NextResponse.json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
