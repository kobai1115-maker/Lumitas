import { NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth-server'
import { analyzeIncidentVoice } from '@/lib/gemini'

import { z } from 'zod'

const analysisSchema = z.object({
  text: z.string().min(1).max(5000)
})

export async function POST(req: Request) {
  try {
    const { user, error: authError } = await getServerAuthUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const result = analysisSchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input text' }, { status: 400 })
    }

    const analysis = await analyzeIncidentVoice(result.data.text)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Incident analysis API error:', error)
    return NextResponse.json({ error: 'Failed to analyze incident' }, { status: 500 })
  }
}
