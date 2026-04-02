import { NextResponse } from 'next/server'
import { scoreIncidentReport } from '@/lib/gemini'
import prisma from '@/lib/prisma'


export const maxDuration = 60 // Cloudflare Pages Edge Runtime / Next.js逕ｨ縺ｮ繧ｿ繧､繝繧｢繧ｦ繝郁ｨｭ螳・
export async function POST(req: Request) {
  try {
    const { description, preventionIdea } = await req.json()

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    // 1. Gemini AI縺ｫ繧医ｋ繧ｹ繧ｳ繧｢繝ｪ繝ｳ繧ｰ縺ｨ繝輔ぅ繝ｼ繝峨ヰ繝・け縺ｮ逕滓・
    const aiResult = await scoreIncidentReport(description, preventionIdea || '')

    // 2. 譛ｬ譚･縺ｯ縺薙％縺ｧDB(Prisma)縺ｫIncidentReport繝｢繝・Ν縺ｨ縺励※菫晏ｭ倥☆繧句・逅・ｒ螳溯｣・    // DB縺ｸ縺ｮ謖ｿ蜈･蜃ｦ逅・(螟ｱ謨励＠縺ｦ繧・I邨先棡縺ｯ霑斐☆繧医≧縺ｫ try-catch)
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

    // 3. 邨先棡繧偵ヵ繝ｭ繝ｳ繝医お繝ｳ繝峨∈霑斐☆
    return NextResponse.json({
      points: aiResult.points,
      feedback: aiResult.feedback
    })
  } catch (error) {
    console.error('API /incident-score error:', error)
    return NextResponse.json({ error: 'Failed to process incident report' }, { status: 500 })
  }
}
