'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { IncidentType } from '@prisma/client'

// AIのフィードバックを受け取るための型
type ScoreResult = {
  points: number
  feedback: string
}

export default function IncidentForm() {
  const [incidentType, setIncidentType] = useState<IncidentType>('NEAR_MISS')
  const [description, setDescription] = useState('')
  const [preventionIdea, setPreventionIdea] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      // AIスコアリングエンドポイントの呼び出し
      const res = await fetch('/api/ai/incident-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, preventionIdea })
      })
      
      const data = await res.json()
      if (data.points !== undefined) {
        setResult(data)
      } else {
        throw new Error('API Error')
      }
    } catch (error) {
      console.error(error)
      setResult({ points: 2, feedback: '報告ありがとうございます。通信エラーのためAIスコアリングは後で実行されます。' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg border-gray-100 overflow-hidden">
      <CardHeader className="bg-orange-50/50 border-b border-orange-100 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-6 h-6 text-orange-500" />
          <CardTitle className="text-xl">ヒヤリハット・インシデント報告</CardTitle>
        </div>
        <CardDescription className="text-gray-600">
          「ジャスト・カルチャー（公正な文化）」に基づき、失敗を責めるのではなく、システムの改善を評価します。
          改善策の提案にはAIが <b>改善ポイント</b> を付与します。
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                  className="bg-green-100 p-4 rounded-full"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </motion.div>
                {result.points > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -top-2 -right-4 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white"
                  >
                    <Sparkles className="w-3 h-3" /> +{result.points}pt
                  </motion.div>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">報告を受理しました！</h3>
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed border border-blue-100 max-w-md shadow-sm relative">
                <span className="absolute -top-3 left-4 bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded">
                  AI フィードバック
                </span>
                {result.feedback}
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  setResult(null)
                  setDescription('')
                  setPreventionIdea('')
                }}
                className="mt-4"
              >
                新しい報告を作成
              </Button>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700">報告の種類 <span className="text-red-500 font-normal">*</span></Label>
                <div className="flex gap-3">
                  {(['NEAR_MISS', 'ACCIDENT', 'IMPROVEMENT_IDEA'] as IncidentType[]).map((type) => {
                    const labels = {
                      NEAR_MISS: 'ヒヤリハット',
                      ACCIDENT: '事故・インシデント',
                      IMPROVEMENT_IDEA: '業務改善提案'
                    }
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setIncidentType(type)}
                        className={`flex-1 py-2 px-3 text-sm rounded-lg border-2 font-medium transition-all ${
                          incidentType === type 
                            ? 'border-primary bg-primary/10 text-primary scale-[1.02] shadow-sm' 
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {labels[type]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-gray-700">
                  何が起きましたか？（客観的な事実） <span className="text-red-500 font-normal">*</span>
                </Label>
                <Textarea
                  id="description"
                  required
                  placeholder="例: 14:00頃、A様がベッドから車椅子へ移乗する際、足がもつれて尻もちをつきそうになった。"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] resize-none border-gray-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1 border-t border-gray-100 pt-4 mt-2">
                  <Label htmlFor="preventionIdea" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    再発防止・改善のアイデア
                  </Label>
                  <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200 bg-gray-50">
                    任意（入力すると評価UP!）
                  </Badge>
                </div>
                <Textarea
                  id="preventionIdea"
                  placeholder="例: ベッドサイドのスペースが狭かったため、移乗前にキャビネットを少し離すルールにする。"
                  value={preventionIdea}
                  onChange={(e) => setPreventionIdea(e.target.value)}
                  className="min-h-[80px] resize-none border-gray-200 bg-yellow-50/30 focus:bg-white shadow-inner"
                />
                <p className="text-[10px] text-gray-500">
                  ※自分を責める必要はありません。「システムや環境をどう変えれば解決するか」を共に考えましょう。
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full text-md font-bold py-6 shadow-md shadow-primary/20 transition-all hover:scale-[1.01]"
                disabled={isSubmitting || !description.trim()}
              >
                {isSubmitting ? 'AIが評価中...' : '報告を提出し、AIでスコアリング'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
