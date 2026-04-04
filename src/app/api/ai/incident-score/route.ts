import { NextResponse } from 'next/server'
import { scoreIncidentReport } from '@/lib/gemini'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

export const maxDuration = 60 // Next.js用のタイムアウト設定

export async function GET(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await (prisma as any).incidentReport.findMany({
      where: {
        reporterId: user.id,
        corporationId: user.corporationId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // 直近20件
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('API /incident-score GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { user: currentUser, error: authError } = await getServerAuthUser()
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { description, preventionIdea, type, unitId } = await req.json()

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    // 1. Gemini AIによるスコアリングとフィードバックの生成
    const aiResult = await scoreIncidentReport(description, preventionIdea || '')

    // 2. DBへの挿入処理 (所属情報を確実に紐付ける)
    try {
      await (prisma as any).incidentReport.create({
        data: {
          corporationId: currentUser.corporationId,
          facilityId: currentUser.facilityId,
          unitId: unitId || currentUser.unitId,
          reporterId: currentUser.id,
          type: type || 'NEAR_MISS',
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
