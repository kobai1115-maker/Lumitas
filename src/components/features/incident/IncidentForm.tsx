'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, ChevronRight, Info, Lightbulb, Send, Sparkles, Star, Target, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useProfile } from '@/hooks/use-profile'
import VoiceInputFab from '@/components/features/evaluation/VoiceInputFab'

type IncidentFormProps = {
  onSuccess?: () => void
}

export default function IncidentForm({ onSuccess }: IncidentFormProps) {
  const { profile } = useProfile()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'NEAR_MISS',
    description: '',
    preventionIdea: '',
    unitId: '',
  })
  const [aiResult, setAiResult] = useState<{ points: number; feedback: string; analysis?: string; riskCategory?: string } | null>(null)

  const handleVoiceResult = (text: string) => {
    setFormData(prev => ({ 
      ...prev, 
      description: prev.description ? `${prev.description}\n${text}` : text 
    }))
  }

  const handleSubmit = async () => {
    if (!formData.description) return
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/ai/incident-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData,
          unitId: profile?.unitId 
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setAiResult(data)
        setStep(3)
        if (onSuccess) onSuccess()
      } else {
        throw new Error('API Error')
      }
    } catch (e) {
      console.error(e)
      setAiResult({ points: 2, feedback: '報告を受理しました。分析は後ほど実行されます。' })
      setStep(3)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 relative">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black text-gray-900 group flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-primary rounded-full" />
                   報告の種類を選択
                </Label>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">必須</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'NEAR_MISS', label: 'ヒヤリハット', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { id: 'GOOD_CATCH', label: 'できたこと・良い気づき', icon: Lightbulb, color: 'text-green-500', bg: 'bg-green-100' },
                  { id: 'ACCIDENT', label: '事故報告', icon: Info, color: 'text-red-500', bg: 'bg-red-50' },
                  { id: 'IMPROVEMENT', label: '改善提案', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFormData({ ...formData, type: t.id })}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.type === t.id ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${t.bg}`}>
                      <t.icon className={`w-6 h-6 ${t.color}`} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black text-gray-900 group flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-primary rounded-full" />
                   状況を詳しく教えてください
                </Label>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">必須</Badge>
              </div>
              <Textarea
                placeholder="いつ、どこで、何が起きたか... もしくは何ができたか？&#10;下のマイクボタンを使って話すと、AIが自動で整形します！"
                className="min-h-[160px] rounded-[2rem] border-gray-100 bg-gray-50/50 p-6 text-sm font-bold leading-relaxed focus:bg-white transition-all shadow-inner"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-[10px] text-gray-400 font-bold px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> 下のマイクボタンを使って、状況を話してみてください。
              </p>
            </div>

            <Button 
              className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20"
              disabled={!formData.description}
              onClick={() => setStep(2)}
            >
              分析・対策入力へ <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                  再発防止策・気づき（評価アップ！）
                </Label>
                <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200 bg-gray-50 uppercase tracking-tighter">Optional</Badge>
              </div>
              <Textarea
                placeholder="どうすれば防げたか、あるいはどのように気づいたか..."
                className="min-h-[160px] rounded-[2rem] border-gray-100 bg-gray-50/50 p-6 text-sm font-bold leading-relaxed focus:bg-white transition-all shadow-inner"
                value={formData.preventionIdea}
                onChange={(e) => setFormData({ ...formData, preventionIdea: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => setStep(1)}>
                戻る
              </Button>
              <Button className="h-14 flex-[2] rounded-2xl font-black shadow-xl shadow-primary/20" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'AIが分析中...' : '報告してAI評価をもらう'} <Send className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && aiResult && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <Card className={`rounded-[3rem] border-none shadow-2xl overflow-hidden ${aiResult.points >= 4 ? 'bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white' : 'bg-white'}`}>
              <CardContent className="p-8 text-center space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
                    {aiResult.points >= 4 ? (
                      <div className="relative">
                        <div className="absolute inset-x-0 -bottom-2 bg-primary/40 blur-2xl h-12 rounded-full animate-pulse" />
                        <div className="bg-primary p-6 rounded-full relative z-10 shadow-[0_0_40px_rgba(255,200,0,0.4)]">
                          <Star className="w-12 h-12 text-black fill-current animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-primary/10 p-6 rounded-full">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                      </div>
                    )}
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{aiResult.points >= 4 ? '✨ グッドキャッチ！' : '報告を受理しました'}</h2>
                    <p className={`text-[10px] font-bold mt-1 uppercase tracking-[0.2em] ${aiResult.points >= 4 ? 'text-primary' : 'text-gray-400'}`}>
                      AI Analysis & Bonus Points Applied
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <Star className={`w-8 h-8 ${i < aiResult.points ? 'fill-primary text-primary' : (aiResult.points >= 4 ? 'text-gray-800' : 'text-gray-100')}`} />
                    </motion.div>
                  ))}
                </div>

                <div className={`p-6 rounded-3xl ${aiResult.points >= 4 ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-50'}`}>
                   <p className="text-sm font-black leading-relaxed italic">
                     &quot;{aiResult.feedback}&quot;
                   </p>
                </div>

                <div className="space-y-4">
                  {aiResult.riskCategory && (
                    <div className="flex items-center justify-center gap-2">
                       <Badge variant="outline" className={`text-[10px] font-black px-4 py-1.5 rounded-full ${aiResult.points >= 4 ? 'border-primary/30 text-primary' : 'bg-orange-50 text-orange-600 border-none'}`}>
                         判定カテゴリ: {aiResult.riskCategory}
                       </Badge>
                    </div>
                  )}
                  
                  {aiResult.analysis && (
                    <div className={`text-xs leading-relaxed text-left p-6 rounded-2xl border ${aiResult.points >= 4 ? 'bg-black/40 border-white/5 text-gray-300' : 'bg-gray-50/50 border-gray-100 text-gray-600'}`}>
                      <p className="font-bold mb-3 opacity-50 uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5" /> AI Risk Analysis Report
                      </p>
                      {aiResult.analysis}
                    </div>
                  )}
                </div>

                <Button 
                  className={`w-full h-14 rounded-2xl font-black shadow-xl ${aiResult.points >= 4 ? 'bg-primary text-black hover:bg-primary/90' : ''}`}
                  onClick={() => window.location.reload()}
                >
                  ダッシュボードへ戻る
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceInputFab onResult={handleVoiceResult} />
    </div>
  )
}
