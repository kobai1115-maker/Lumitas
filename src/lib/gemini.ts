import { GoogleGenAI } from '@google/genai'
import { GeminiEvalResult, GeminiIncidentScoreResult } from '@/types'

// SDKインスタンス化。NEXT_PUBLICではなく、サーバーサイド環境変数から取得
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })
const MODEL_NAME = 'gemini-3.1-flash' // デフォルトモデル

/**
 * ユーザーの音声入力（テキスト化後）を客観的な評価文に変換
 * @param userInputText 音声から取得したテキスト
 * @returns 構造化テキストと該当カテゴリ名
 */
export async function convertVoiceToEvaluation(userInputText: string): Promise<GeminiEvalResult> {
  const systemPrompt = `
あなたは福祉業界専門の人事考課AIアシスタントです。
以下のユーザーの入力を『客観的な事実（誰が・いつ・何をして・どんな結果になったか）』に基づく人事考課用のテキストに変換してください。
一人称は使用せず、第三者視点の行動記録として出力してください。
また、その内容が最も該当する評価項目（技術スキル、コミュニケーション、安全配慮、リーダーシップ、コンプライアンス等）を1つ選択してください。

以下のJSONフォーマットのみ（Markdown不要）で返却すること：
{
  "structuredText": "（客観的な評価用テキスト）",
  "category": "（評価項目名）"
}
`

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: `ユーザー入力: ${userInputText}` }] }
      ]
    })
    
    // JSONのパース（Markdownバッククォートが含まれている場合の対策）
    const rawText = response.text || '{}'
    const jsonString = rawText.replace(/```json\n?|```\n?/g, '').trim()
    return JSON.parse(jsonString) as GeminiEvalResult
  } catch (error) {
    console.error('Gemini VoiceToEval Error:', error)
    return {
      structuredText: 'AI処理に失敗しました。時間をおいて再試行してください。',
      category: 'Unchecked'
    }
  }
}

/**
 * インシデント報告内容のスコアリングとフィードバックの生成
 * @param description インシデント報告内容
 * @param preventionIdea 改善策の提案
 * @returns 加点ポイントとフィードバックコメント
 */
export async function scoreIncidentReport(description: string, preventionIdea: string): Promise<GeminiIncidentScoreResult> {
  const systemPrompt = `
提出されたヒヤリハット・インシデント報告と改善策をジャスト・カルチャーの視点から評価してください。
報告者を責めるのではなく、再発防止の取り組みを評価して加点します。

以下の基準でポイント（points）を設定してください：
- 5ポイント: 再発防止に対して「実現可能性が高く」「創意工夫が見られる」場合
- 3ポイント: 標準的で適切な改善策の提案がある場合
- 2ポイント: 事実の報告のみ（提案なし、または具体性がない）の場合
- 0ポイント: 内容が不十分または不適切な場合

以下のJSONフォーマットのみ（Markdown不要）で返却すること：
{
  "points": number,
  "feedback": "AIからのポジティブで励みになるコメント（長すぎず簡潔に）"
}
`

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: `報告内容: ${description}\n改善策: ${preventionIdea}` }] }
      ]
    })

    const rawText = response.text || '{"points":0,"feedback":"解析失敗"}'
    const jsonString = rawText.replace(/```json\n?|```\n?/g, '').trim()
    return JSON.parse(jsonString) as GeminiIncidentScoreResult
  } catch (error) {
    console.error('Gemini IncidentScore Error:', error)
    return {
      points: 2,
      feedback: '報告ありがとうございます。引き続き安全管理へのご協力をお願いします。（AI処理エラー）'
    }
  }
}
