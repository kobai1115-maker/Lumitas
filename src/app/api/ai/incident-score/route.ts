import { NextResponse } from 'next/server'
import { scoreIncidentReport } from '@/lib/gemini'
import prisma from '@/lib/prisma'

export const runtime = 'edge'
export const maxDuration = 60 // Cloudflare Pages Edge Runtime / Next.js用のタイムアウト設定

export async function POST(req: Request) {
  try {
    const { description, preventionIdea } = await req.json()

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    // 1. Gemini AIによるスコアリングとフィードバックの生成
    const aiResult = await scoreIncidentReport(description, preventionIdea || '')

    // 2. 本来はここでDB(Prisma)にIncidentReportモデルとして保存する処理を実装
    // DBへの挿入処理 (失敗してもAI結果は返すように try-catch)
    try {
      await prisma.incidentReport.create({
        data: {
          corporationId: 'corp-001',
          reporterId: 'demo-user-id',
          type: 'NEAR_MISS',
          description,
          preventionIdea,
          aiEvaluatedPoints: aiResult.points
        }
      })
    } catch (dbError) {
      console.warn('Incident report save skipped (DB unavailable):', dbError)
    }

    // 3. 結果をフロントエンドへ返す
    return NextResponse.json({
      points: aiResult.points,
      feedback: aiResult.feedback
    })
  } catch (error) {
    console.error('API /incident-score error:', error)
    return NextResponse.json({ error: 'Failed to process incident report' }, { status: 500 })
  }
}
