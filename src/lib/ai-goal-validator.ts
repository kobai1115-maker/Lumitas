import { GoogleGenAI } from '@google/genai'
import prisma from './prisma'

/**
 * Gemini SDKインスタンス取得
 */
function getGeminiClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })
}

const MODEL_NAME = 'gemini-1.5-flash'

/**
 * 個人の目標と法人の理念・事業目標（OrgGoal）の連動性を診断する
 */
export async function analyzeGoalAlignment(
  corporationId: string,
  goalTitle: string,
  goalType: 'DAILY' | 'EVENT' | 'YEARLY'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  
  // 法人の最上位目標（理念・事業目標）を取得
  const orgGoals = await prisma.orgGoal.findMany({
    where: { 
      corporationId,
      level: { in: ['MISSION', 'CORPORATE'] } 
    },
    select: { title: true, description: true, level: true }
  })

  // 理念情報のテキスト化
  const philosophyText = orgGoals.length > 0 
    ? orgGoals.map(g => `・[${g.level}] ${g.title}: ${g.description}`).join('\n')
    : '※現在、法人の明文化された理念は登録されていませんが、一般的な福祉・介護の尊厳保持を目指しています。'

  const typeLabels = {
    DAILY: '毎日の行動目標',
    EVENT: '期間目標（◯ヶ月、行事関連）',
    YEARLY: '1年の成長目標'
  }

  if (!apiKey || apiKey === '') {
    return `理念連動診断（デモ）: あなたの「${goalTitle}」は、法人の理念を現場で体現する大切な ${typeLabels[goalType]} です。一つひとつの積み重ねが、大きな事業目標の達成へと着実に繋がっています！`
  }

  const systemPrompt = `
あなたは福祉・介護法人の理念と、現場スタッフの努力を繋ぎ合わせる「インスピレーション・コーチングAI」です。

役割：
提出されたスタッフの『個人目標』が、法人の『理念・事業目標』とどのように連動し、貢献しているかを分析し、スタッフの背中を強力に押すポジティブな診断メッセージ（100文字程度）を生成してください。

ルール：
1. 「理念のどの部分と繋がっているか」を具体的に指摘する。
2. その行動が、最終的に「利用者の喜び」や「事業の成功」にいかに貢献するかを解き明かす。
3. 非常にポジティブで、スタッフ自身の自己肯定感と所属意識（エンゲージメント）が高まる口調にする。
4. 返却は「診断結果のテキストのみ」としてください（JSON不要）。
`

  try {
    const ai = getGeminiClient()
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `${systemPrompt}\n\n【法人の理念・事業目標】\n${philosophyText}\n\n【スタッフの目標】\nタイプ: ${typeLabels[goalType]}\n内容: ${goalTitle}`
    })
    return (result.text || '').trim()
  } catch (error) {
    console.error('Gemini Goal Alignment Analysis Error:', error)
    return `あなたの目標「${goalTitle}」は、法人の未来を創る大切なピースです。その一歩が、大きな目標達成の原動力となります！`
  }
}
