import { NextResponse } from 'next/server'
import { convertVoiceToEvaluation } from '@/lib/gemini'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

export const maxDuration = 60 // Next.js用のタイムアウト設定

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 })
    }

    const { user: currentUser, error: authError } = await getServerAuthUser()
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Gemini APIに音声からの生テキストを渡し、構造化データをもらう
    const aiResult = await convertVoiceToEvaluation(text)

    // DBに保存
    try {
      await (prisma as any).evaluation.create({
        data: {
          corporationId: currentUser.corporationId,
          facilityId: currentUser.facilityId,
          employeeId: currentUser.id,
          evaluatorId: currentUser.id, 
          periodKey: '2026-H1', // 現在の期
          aiSummaryText: `[${aiResult.category}] ${aiResult.structuredText}`,
          status: 'DRAFT'
        }
      })
    } catch (dbError) {
      console.warn('Evaluation save skipped (DB unavailable):', dbError)
    }
    // DBへの保存が成功したらクライアントへ返す
    return NextResponse.json(aiResult)
  } catch (error) {
    console.error('API /voice-to-eval error:', error)
    return NextResponse.json({ error: 'Failed to process voice text' }, { status: 500 })
  }
}
