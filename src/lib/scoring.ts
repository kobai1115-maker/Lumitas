import { IncidentReport } from '@prisma/client'
import { ScoringResult } from '@/types'

/**
 * 評価スコア算出ロジック
 * @param achievement MBO達成度 (0-100)
 * @param competencyAvg 職種別コンピテンシー平均 (1-5を0-100に換算)
 * @param receivedBonusCount 受信したピアボーナス件数
 * @param incidentReports 提出したインシデント報告の配列（AI加点付き）
 * @returns {ScoringResult} 成績、能力、情意、総合スコアと最終グレード
 */
export function calculateTotalScore(
  achievement: number,
  competencyAvg: number,
  receivedBonusCount: number,
  incidentReports: IncidentReport[]
): ScoringResult {
  // 1. 成績 (Achievement) - 40%
  // achievement = 0-100 の範囲を想定
  const achScore = achievement * 0.4

  // 2. 能力 (Competency) - 30%
  // コンピテンシー評価（1.0 - 5.0など）を0-100スケールに正規化（例：5.0 -> 100, 1.0 -> 20）
  // (value / 5.0) * 100
  const normalizedCompetency = Math.max(0, Math.min(100, (competencyAvg / 5.0) * 100))
  const compScore = normalizedCompetency * 0.3

  // 3. 情意 (Sentiment) - 30% 
  // 基礎点(20点) + ピアボーナス加点(1件2点) + インシデント改善加点(Gemini算出)
  const incidentBonus = incidentReports.reduce((acc, curr) => acc + (curr.aiEvaluatedPoints || 0), 0)
  const sentimentRaw = 20 + (receivedBonusCount * 2) + incidentBonus
  const cappedSentimentRaw = Math.min(sentimentRaw, 100) // 最大100点にキャップ
  const sentScore = cappedSentimentRaw * 0.3

  const totalScore = achScore + compScore + sentScore

  // 最終評価グレードの判定
  let finalGrade: 'S' | 'A' | 'B' | 'C' | 'D' = 'C'
  if (totalScore >= 90) {
    finalGrade = 'S'
  } else if (totalScore >= 80) {
    finalGrade = 'A'
  } else if (totalScore >= 70) {
    finalGrade = 'B'
  } else if (totalScore >= 60) {
    finalGrade = 'C'
  } else {
    finalGrade = 'D'
  }

  return {
    achievementScore: Number(achScore.toFixed(1)),
    competencyScore: Number(compScore.toFixed(1)),
    sentimentScore: Number(sentScore.toFixed(1)),
    totalScore: Number(totalScore.toFixed(1)),
    finalGrade
  }
}
