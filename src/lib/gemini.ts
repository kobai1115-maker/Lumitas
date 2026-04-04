import { GoogleGenAI } from '@google/genai'
import { GeminiEvalResult, GeminiIncidentScoreResult } from '@/types'

// SDKインスタンス取得関数
function getGeminiClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })
}

const MODEL_NAME = 'gemini-1.5-flash'

/**
 * ユーザーの音声入力（テキスト化後）を客観的な評価文に変換
 */
export async function convertVoiceToEvaluation(userInputText: string): Promise<GeminiEvalResult> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey || apiKey === '') {
    console.log('Gemini: Using demo mode for VoiceToEval')
    // デモモードロジック（そのまま維持）
    let category = '技術スキル'
    if (userInputText.includes('記録') || userInputText.includes('システム')) category = 'コンプライアンス'
    if (userInputText.includes('声') || userInputText.includes('相談') || userInputText.includes('家族')) category = 'コミュニケーション'
    if (userInputText.includes('リーダー') || userInputText.includes('調整')) category = 'リーダーシップ'
    if (userInputText.includes('不穏') || userInputText.includes('転倒') || userInputText.includes('薬')) category = '安全配慮'

    return {
      structuredText: `【AI解析】${userInputText}。この行動は${category}の向上に寄与する内容として記録されました。`,
      category
    }
  }

  const systemPrompt = `
あなたは福祉・介護業界専門の人事考課AIアシスタントです。
役割：ユーザーの不安定な音声入力テキストを、プロフェッショナルな『介護記録・人事考課用』の客観的な事実に変換してください。

ルール：
1. 「えーと」「あのー」などのフィラーを完全に除去する。
2. 日常語を適切な介護専門用語に変換する（例：「ふらふらしていた」→「歩行不安定・不穏状態」、「薬を間違えそうになった」→「誤薬のリスクを検知」など）。
3. 信頼性の高い、第三者が読んでも状況がわかる「客観的な文章」にする。
4. 最も該当する評価項目を1つ選択してください（技術スキル, コミュニケーション, チームワーク, 安全配慮, コンプライアンス）。

返却形式（厳守）：JSONのみ
{"structuredText": "整形後の文章", "category": "評価項目"}
`
  try {
    const ai = getGeminiClient()
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `${systemPrompt}\nユーザー入力: ${userInputText}`
    })
    const rawText = result.text || ''
    const jsonString = rawText.replace(/```json\n?|```\n?/g, '').trim()
    return JSON.parse(jsonString) as GeminiEvalResult
  } catch (error) {
    console.error('Gemini VoiceToEval Error:', error)
    return { structuredText: `【記録】${userInputText}`, category: 'Unchecked' }
  }
}

/**
 * インシデント報告内容のスコアリングと詳細分析
 */
export async function scoreIncidentReport(description: string, preventionIdea: string): Promise<GeminiIncidentScoreResult> {
  const apiKey = process.env.GEMINI_API_KEY
  
  // デモ/エラー時の高度なシミュレーション
  if (!apiKey || apiKey === '') {
    console.log('Gemini: Using demo mode for IncidentScore (Detailed Analysis)')
    await new Promise(r => setTimeout(r, 1000))
    
    let points = 3
    let category = "その他（全般）"
    let feedback = "詳細なご報告ありがとうございます。現場の安全意識が高まっている証拠です。"
    let analysis = "現場の状況報告を確認しました。再発防止に向けた取り組みを継続してください。"
    
    const text = (description + preventionIdea).toLowerCase()

    if (text.includes('転倒') || text.includes('転落')) {
      category = "転倒・転落"
      points = 4
    } else if (text.includes('薬') || text.includes('誤飲')) {
      category = "誤薬・誤飲"
      points = 4
    }

    // 「防いだ」「気づいた」などのグッドキャッチ要素がある場合
    if (text.includes('未然') || text.includes('防いだ') || text.includes('気づい') || text.includes('早めに')) {
      points = 5
      feedback = "🌟 素晴らしいグッドキャッチです！あなたの気づきが大きな事故を未然に防ぎました。チーム全員で賞賛すべき行動です。"
    }

    return { points, feedback, riskCategory: category, analysis }
  }

  const systemPrompt = `
あなたは介護現場の安全管理（リスクマネジメント）の専門家です。
提出された「ヒヤリハット・事故・グッドキャッチ」の報告を分析し、JSONで返してください。

最重要ミッション：
「事故を未然に防いだ気づき（グッドキャッチ）」を積極的に見つけ、最大級の称賛と高いポイントを与えてください。

評価基準：
- 事故を未然に防いだ、または早期に異常に気づいた場合：4〜5点（グッドキャッチとして高く評価）
- 具体的で実行性の高い再発防止策を提案している場合：4〜5点
- 単なる事実報告のみの場合：2〜3点

返却形式（厳守）：JSONのみ
{
  "points": 0-5の数値,
  "feedback": "ポジティブな励まし・賞賛メッセージ（50文字以内）",
  "riskCategory": "判定されたリスクカテゴリ",
  "analysis": "具体的なリスク分析と専門的なアドバイス、または行動への賞賛（150文字程度）"
}
`
  try {
    const ai = getGeminiClient()
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `${systemPrompt}\n報告内容: ${description}\n対策/気づき: ${preventionIdea}`
    })
    const rawText = result.text || ''
    const jsonString = rawText.replace(/```json\n?|```\n?/g, '').trim()
    return JSON.parse(jsonString) as GeminiIncidentScoreResult
  } catch (error) {
    console.error('Gemini IncidentScore Error:', error)
    return { points: 2, feedback: '受理されました。', riskCategory: '未判定', analysis: '解析に失敗しました。' }
  }
}
