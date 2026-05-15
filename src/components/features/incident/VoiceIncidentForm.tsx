'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, Sparkles, AlertCircle, CheckCircle2, Loader2, RefreshCw, X, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { GeminiVoiceIncidentResult } from '@/types'

// Web Speech API の型定義（簡易）
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: (event: any) => void
  onerror: (event: any) => void
  onend: () => void
}

export default function VoiceIncidentForm() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<GeminiVoiceIncidentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState<{ points: number, feedback: string } | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // 音声認識の初期化
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ja-JP'

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            setTranscript(prev => (prev + transcriptText).slice(0, 5000))
          } else {
            interimTranscript += transcriptText
          }
        }
      }

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setError('マイクへのアクセスが許可されていません。ブラウザの設定を確認してください。')
        } else {
          setError(`音声認識エラー: ${event.error}`)
        }
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    } else {
      setError('お使いのブラウザは音声認識（Web Speech API）に対応していません。Google Chrome等の最新ブラウザをご利用ください。')
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors during cleanup
        }
        recognitionRef.current = null
      }
    }
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      setTranscript('')
      setError(null)
      setAnalysisResult(null)
      try {
        recognitionRef.current?.start()
        setIsRecording(true)
      } catch (e) {
        console.error('Start recording error:', e)
      }
    }
  }, [isRecording])

  const handleAnalyze = async () => {
    if (!transcript) return
    setIsAnalyzing(true)
    setError(null)
    setIsSaved(false)

    try {
      const res = await fetch('/api/incident/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript })
      })

      if (res.ok) {
        const data = await res.json()
        setAnalysisResult(data)
      } else {
        throw new Error('Analysis failed')
      }
    } catch (e) {
      setError('AIによる解析に失敗しました。もう一度お試しください。')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!analysisResult) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: analysisResult.description,
          preventionIdea: analysisResult.preventionIdea,
          riskCategory: analysisResult.riskCategory,
          riskLevel: analysisResult.riskLevel,
          location: analysisResult.location,
          involvedUser: analysisResult.involvedUser,
          isAiGenerated: true,
          rawVoiceText: transcript
        })
      })

      if (res.ok) {
        const data = await res.json()
        setSavedFeedback({ points: data.points, feedback: data.feedback })
        setIsSaved(true)
      } else {
        throw new Error('Save failed')
      }
    } catch (e) {
      setError('保存に失敗しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAnalysisResult(null)
    setTranscript('')
    setIsSaved(false)
    setSavedFeedback(null)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden bg-white/80 backdrop-blur-md border-gray-100 shadow-2xl rounded-[32px] p-8">
      <AnimatePresence mode="wait">
        {isSaved ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center py-8"
          >
            <div className="relative mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-green-400 rounded-full"
              />
            </div>

            <h2 className="text-2xl font-black text-gray-800 mb-2">報告が完了しました！</h2>
            <p className="text-sm text-gray-500 font-bold mb-8">AIがあなたの貢献を記録しました</p>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[32px] p-8 w-full border border-green-100 mb-8 shadow-inner relative overflow-hidden text-left">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Sparkles className="w-24 h-24 text-green-600" />
               </div>
               
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full text-green-600 shadow-sm mb-4">
                 <Award className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Welfare Point: +{savedFeedback?.points}</span>
               </div>

               <p className="text-lg font-black text-green-800 leading-relaxed mb-4 relative z-10">
                 「{analysisResult?.praise}」
               </p>
               <p className="text-xs text-green-600 font-bold italic relative z-10 opacity-70">
                 {savedFeedback?.feedback}
               </p>
            </div>

            <Button onClick={resetForm} className="rounded-full h-12 px-10 bg-gray-900 text-white font-black hover:bg-gray-800 transition-all active:scale-95">
              新しく報告する
            </Button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800">AI音声インシデント報告</h2>
                <p className="text-xs text-gray-500 font-bold">話すだけで、AIが報告書を自動構成します</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <div className={cn(
                  "w-full min-h-[160px] p-6 rounded-[24px] border-2 transition-all duration-500 bg-gray-50/50",
                  isRecording ? "border-rose-400 ring-4 ring-rose-100" : "border-dashed border-gray-200 group-hover:border-gray-300"
                )}>
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <AnimatePresence mode="wait">
                      {isRecording ? (
                        <motion.div key="recording" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-rose-400 rounded-full" />
                            <Button size="icon" variant="destructive" className="w-16 h-16 rounded-full shadow-lg relative z-10" onClick={toggleRecording}><MicOff className="w-8 h-8" /></Button>
                          </div>
                          <span className="text-sm font-black text-rose-500 animate-pulse uppercase tracking-widest">録音中...</span>
                        </motion.div>
                      ) : (
                        <motion.div key="idle" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center gap-4">
                          <Button size="icon" className="w-16 h-16 rounded-full bg-gray-900 hover:bg-gray-800 shadow-lg" onClick={toggleRecording}><Mic className="w-8 h-8 text-white" /></Button>
                          <span className="text-sm font-bold text-gray-400">マイクを押して話し始める</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="w-full mt-4">
                      <p className={cn("text-sm font-bold leading-relaxed transition-colors", transcript ? "text-gray-700" : "text-gray-300 italic text-center")}>
                        {transcript || (isRecording ? "お話しください..." : "（ここに話した内容が表示されます）")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {transcript && !isRecording && !analysisResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                  <Button onClick={handleAnalyze} disabled={isAnalyzing} className="rounded-full h-12 px-8 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-black text-sm shadow-xl shadow-rose-200">
                    {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AIが分析中...</> : <><Sparkles className="w-4 h-4 mr-2" />AIで報告書を作成する</>}
                  </Button>
                </motion.div>
              )}

              <AnimatePresence>
                {analysisResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-50 rounded-[24px] border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        <h3 className="font-black text-gray-800">{analysisResult.summary}</h3>
                      </div>
                      <div className={cn("px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase", analysisResult.riskLevel === 'HIGH' ? "bg-rose-100 text-rose-600" : analysisResult.riskLevel === 'MEDIUM' ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600")}>
                        リスクレベル: {analysisResult.riskLevel === 'HIGH' ? '高' : analysisResult.riskLevel === 'MEDIUM' ? '中' : '低'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-tighter">発生場所</span>
                        <p className="text-xs font-bold text-gray-700">{analysisResult.location || '不明'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-tighter">対象者</span>
                        <p className="text-xs font-bold text-gray-700">{analysisResult.involvedUser || '言及なし'}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-tighter">内容（AI整形済み）</span>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">{analysisResult.description}</p>
                    </div>

                    {analysisResult.preventionIdea && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1 text-blue-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">再発防止策</span>
                        </div>
                        <p className="text-xs font-bold text-blue-700">{analysisResult.preventionIdea}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1 rounded-xl font-bold text-gray-500 h-12" onClick={() => setAnalysisResult(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" /> やり直す
                      </Button>
                      <Button disabled={isSubmitting} className="flex-1 rounded-xl bg-gray-900 text-white font-black h-12 shadow-xl shadow-gray-200" onClick={handleSave}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'この内容で報告する'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
