import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { scoreIncidentReport } from '@/lib/gemini'
import { randomUUID } from 'crypto'

import { z } from 'zod'

const incidentSchema = z.object({
  description: z.string().min(1).max(5000),
  preventionIdea: z.string().max(2000).optional().nullable(),
  riskCategory: z.string().optional(),
  riskLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  location: z.string().max(100).optional().nullable(),
  involvedUser: z.string().max(100).optional().nullable(),
  isAiGenerated: z.boolean().optional(),
  rawVoiceText: z.string().max(5000).optional().nullable()
})

export async function POST(req: Request) {
  try {
    const { user, error: authError } = await getServerAuthUser()
    if (authError || !user || !user.corporationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const result = incidentSchema.safeParse(json)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.format() }, { status: 400 })
    }

    const { 
      description, 
      preventionIdea, 
      riskCategory, 
      riskLevel, 
      isAiGenerated, 
      rawVoiceText 
    } = result.data

    // AIによるスコアリングを実行
    const scoring = await scoreIncidentReport(description, preventionIdea || '')

    // インシデントのタイプを判定
    let incidentType: 'NEAR_MISS' | 'ACCIDENT' | 'GOOD_CATCH' = 'NEAR_MISS'
    if (riskLevel === 'HIGH') incidentType = 'ACCIDENT'
    if (description.includes('防いだ') || description.includes('未然')) incidentType = 'GOOD_CATCH'

    const newReport = await prisma.incidentReport.create({
      data: {
        id: randomUUID(),
        reporterId: user.id,
        corporationId: user.corporationId,
        facilityId: user.facilityId,
        unitId: user.unitId || null,
        type: incidentType,
        description,
        preventionIdea: preventionIdea || null,
        aiEvaluatedPoints: scoring.points,
        // @ts-ignore
        isAiGenerated: isAiGenerated || false,
        // @ts-ignore
        rawVoiceText: rawVoiceText || null
      }
    })

    return NextResponse.json({
        report: newReport,
        points: scoring.points,
        feedback: scoring.feedback
    })
  } catch (error) {
    console.error('Save incident API error:', error)
    return NextResponse.json({ error: 'Failed to save incident report' }, { status: 500 })
  }
}

export async function GET(req: Request) {
    try {
        const { user, error: authError } = await getServerAuthUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const reports = await prisma.incidentReport.findMany({
            where: { corporationId: user.corporationId, reporterId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        return NextResponse.json(reports)
    } catch (error) {
        console.error('Fetch incidents API error:', error)
        return NextResponse.json({ error: 'Failed to fetch incident reports' }, { status: 500 })
    }
}
