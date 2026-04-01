import { NextResponse } from 'next/server'
import { convertVoiceToEvaluation } from '@/lib/gemini'

export const maxDuration = 60 // Cloudflare Pages Edge Runtime / Next.js用のタイムアウト設定

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 })
    }

    // Gemini APIに音声からの生テキストを渡し、構造化データをもらう
    const aiResult = await convertVoiceToEvaluation(text)

    // 本来はここでDBに保存する処理を入れるなど
    // DBへの保存が成功したらクライアントへ返す
    
    return NextResponse.json(aiResult)
  } catch (error) {
    console.error('API /voice-to-eval error:', error)
    return NextResponse.json({ error: 'Failed to process voice text' }, { status: 500 })
  }
}
