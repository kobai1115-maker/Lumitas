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
    await new Promise(r => setTimeout(r, 800))
    
    let category = '技術スキル'
    if (userInputText.includes('記録') || userInputText.includes('システム')) category = 'コンプライアンス'
    if (userInputText.includes('声') || userInputText.includes('相談') || userInputText.includes('家族')) category = 'コミュニケーション'
    if (userInputText.includes('リーダー') || userInputText.includes('調整')) category = 'リーダーシップ'
    if (userInputText.includes('不穏') || userInputText.includes('転倒') || userInputText.includes('薬')) category = '安全配慮'

    return {
      structuredText: `【AI解析済み】${userInputText}。この行動は${category}の向上に寄与する内容として記録されました。`,
      category
    }
  }

  const systemPrompt = `
あなたは福祉業界専門の人事考課AIアシスタントです。
以下のユーザーの入力を『客観的な事実』に基づく人事考課用のテキストに変換してください。
また、最も該当する評価項目を1つ選択してください。
返却形式：{"structuredText": "...", "category": "..."}
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
    await new Promise(r => setTimeout(r, 1500))
    
    let points = 3
    let category = "その他（全般）"
    let feedback = "詳細なご報告ありがとうございます。"
    let analysis = "現場の状況報告を確認しました。再発防止に向けた取り組みを継続してください。"
    
    const text = (description + preventionIdea).toLowerCase()

    if (text.includes('転倒') || text.includes('転落') || text.includes('ふらつき') || text.includes('歩こ')) {
      category = "転倒・転落"
      points = 4
      feedback = "迅速な状況把握と事故防止への取り組みを高く評価します。"
      analysis = "移乗や歩行時の動作確認、および車椅子のブレーキ、足元の整理状況を見直すことが有効です。今回の報告はチーム全体への注意喚起に活用させていただきます。"
    } else if (text.includes('薬') || text.includes('誤飲') || text.includes('飲み間違い')) {
      category = "誤薬・誤飲"
      points = 5
      feedback = "誠実な事故報告を評価します。重大事項に繋がるリスクへの提言が含まれています。"
      analysis = "二重確認の徹底や、配薬BOXの配置位置の見直しなど、システム面での改善策の実行性が高いです。ピアボーナス付与に該当します。"
    } else if (text.includes('不穏') || text.includes('暴言') || text.includes('暴力')) {
      category = "行動・心理症状(BPSD)"
      points = 3
      feedback = "対応お疲れ様です。記録を残すことが、ケアプランの改善に繋がります。"
      analysis = "ケアの際の環境整備や、当日の利用者様のご様子、特定のトリガーがなかったか等をチームで検討していきましょう。"
    }

    if (text.includes('共有') || text.includes('会議') || text.includes('マニュアル')) {
      points = Math.min(5, points + 1)
      feedback = "組織全体の質向上に繋がる提案が含まれているため、加点しました！"
    }

    return { points, feedback, riskCategory: category, analysis }
  }

  const systemPrompt = `
提出されたヒヤリハット報告を分析し、以下のJSONで返してください：
{
  "points": 加点(0-5),
  "feedback": "ポジティブな励まし",
  "riskCategory": "判定されたリスクカテゴリ",
  "analysis": "具体的なリスク分析とアドバイス（150文字程度）"
}
`
  try {
    const ai = getGeminiClient()
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `${systemPrompt}\n報告: ${description}\n対策: ${preventionIdea}`
    })
    const rawText = result.text || ''
    const jsonString = rawText.replace(/```json\n?|```\n?/g, '').trim()
    return JSON.parse(jsonString) as GeminiIncidentScoreResult
  } catch (error) {
    console.error('Gemini IncidentScore Error:', error)
    return { points: 2, feedback: '受理されました。', riskCategory: '未判定', analysis: '解析に失敗しました。' }
  }
}
