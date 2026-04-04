'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, History, Sparkles, Star, Target, CheckCircle2, Flag, Lightbulb, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import IncidentForm from '@/components/features/incident/IncidentForm'

type IncidentReport = {
  id: string
  type: string
  description: string
  preventionIdea?: string
  aiEvaluatedPoints: number
  createdAt: string
}

export default function IncidentPage() {
  const [reports, setReports] = useState<IncidentReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/ai/incident-score')
      if (res.ok) {
        const data = await res.json()
        setReports(data)
      }
    } catch (e) {
      console.error('Fetch reports error:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'GOOD_CATCH':
        return { label: 'できたこと・グッドキャッチ', icon: Lightbulb, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' }
      case 'NEAR_MISS':
        return { label: 'ヒヤリハット', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' }
      case 'ACCIDENT':
        return { label: '事故報告', icon: Info, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' }
      case 'IMPROVEMENT':
      case 'IMPROVEMENT_IDEA':
        return { label: '改善提案', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' }
      default:
        return { label: '報告', icon: Flag, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' }
    }
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-20 pt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              できたこと・気づき記録
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-bold ml-14">
            日々の「できたこと」や「気づき」をAIで価値化しましょう。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 左側：報告フォーム */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pl-2 border-l-4 border-primary">
            <h2 className="text-lg font-black text-gray-800">新しい記録を作成</h2>
          </div>
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
            <CardContent className="p-8">
              <IncidentForm onSuccess={fetchReports} />
            </CardContent>
          </Card>
        </section>

        {/* 右側：履歴 */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-2 border-l-4 border-gray-300 pl-2">
              <h2 className="text-lg font-black text-gray-700">積みあがった記録</h2>
              <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-black">
                {reports.length} 件
              </Badge>
            </div>
            <button onClick={fetchReports} className="text-xs font-bold text-primary hover:underline">更新</button>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto px-2 custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-20 text-gray-400 font-bold animate-pulse">読み込み中...</div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-100">
                <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-gray-400">まだ記録がありません。<br/>左のフォームから最初の記録を！</p>
              </div>
            ) : (
              <AnimatePresence>
                {reports.map((report, idx) => {
                  const style = getTypeStyle(report.type)
                  const Icon = style.icon
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all bg-white group border-l-4 border-l-transparent hover:border-l-primary overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full", style.bg, style.border, "border")}>
                              <Icon className={cn("w-3.5 h-3.5", style.color)} />
                              <span className={cn("text-[10px] font-black", style.color)}>{style.label}</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">
                              {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          
                          <p className="text-sm font-bold text-gray-800 line-clamp-3 mb-4 leading-relaxed">
                            {report.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-3 h-3", i < report.aiEvaluatedPoints ? "fill-primary text-primary" : "text-gray-100")} />
                              ))}
                              <span className="text-[10px] font-black text-primary ml-1">+{report.aiEvaluatedPoints} pts</span>
                            </div>
                            {report.preventionIdea && (
                                <Badge variant="outline" className="text-[9px] font-medium border-gray-100 text-gray-400">
                                    対策あり
                                </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
