'use client'

import React, { useRef, useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Printer, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import EvaluationReportPDF from '@/components/features/evaluation/EvaluationReportPDF'
import '@/styles/print.css'
import Link from 'next/link'

type ReportData = {
  staff: {
    fullName: string
    positionName: string
    departmentName: string
    gradeLevel: number
    lastOneOnOneDate?: string
  }
  metrics: {
    achievement: number
    competency: number
    sentiment: number
    skills: number
    team: number
  }
  aiComment: string
  corpName: string
  locationName: string
}

export default function ReportPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const [data, setData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setError('ユーザーIDが指定されていません')
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/evaluation/report/${userId}`)
        if (!res.ok) {
          throw new Error('データの取得に失敗しました')
        }
        const reportData = await res.json()
        setData(reportData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データ取得エラー')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handlePrint = () => {
    window.print()
  }

  const docId = React.useMemo(() => {
    if (!data) return ''
    return `CG-AI-${data.staff.fullName.charCodeAt(0)}-${Date.now().toString().slice(-4)}`
  }, [data])

  const todayDate = React.useMemo(() => {
    return new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <p className="font-black text-gray-400 tracking-widest text-xs">レポートを作成しています...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center space-y-6">
          <div className="bg-red-50 p-6 rounded-3xl inline-block shadow-2xl shadow-red-500/10">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">レポートを表示できません</h2>
            <p className="text-sm font-bold text-gray-500">{error || '不明なエラーが発生しました'}</p>
          </div>
          <div>
            <Link href="/admin/staff">
              <Button className="rounded-2xl px-8 h-12 font-bold shadow-lg">スタッフ管理に戻る</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100/30 pb-24">
      {/* 操作パネル（印刷されない領域） */}
      <div className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 mb-10 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/staff">
              <Button variant="ghost" className="rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100/50">
                <ArrowLeft className="w-4 h-4" />
                一覧に戻る
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-100" />
            <div>
              <h1 className="text-sm font-black text-gray-900 leading-none mb-1">評価レポート プレビュー</h1>
              <p className="text-[10px] font-bold text-gray-400">{data.staff.fullName} さんの評価レポート（閲覧・PDF出力）</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right mr-4 hidden md:block">
               <p className="text-[10px] font-black text-gray-500 uppercase leading-none mb-1">現在の状態</p>
               <div className="text-xs font-black text-emerald-500 flex items-center gap-1.5 justify-end">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 出力準備完了
               </div>
             </div>
            <Button 
              onClick={handlePrint}
              className="rounded-2xl h-11 px-8 font-black flex items-center gap-2 shadow-2xl shadow-primary/30 transition-transform active:scale-95 bg-gray-900 text-white"
            >
              <Printer className="w-4 h-4" />
              PDFを出力（A4）
            </Button>
          </div>
        </div>
      </div>

      {/* レポート本体 */}
      <div className="flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative transition-all duration-500 hover:scale-[1.005]"
        >
          <EvaluationReportPDF 
            staff={data.staff}
            metrics={data.metrics}
            aiComment={data.aiComment}
            corpName={data.corpName}
            locationName={data.locationName}
            generatedDocId={docId}
            todayDate={todayDate}
          />
        </motion.div>
      </div>

      {/* 補助メッセージ */}
      <div className="no-print mt-16 max-w-2xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur p-8 rounded-[2rem] shadow-xl border border-white/50 text-center">
          <div className="text-xs font-black text-gray-800 mb-4 flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Printer className="w-3.5 h-3.5 text-primary" />
            </div>
            最高の出力品質を得るためのヒント
          </div>
           <div className="grid grid-cols-2 gap-6 text-left">
             <ul className="text-[10px] text-gray-500 font-bold space-y-3">
                <li className="flex gap-2"><span className="text-primary">01</span><span>カラー設定を「カラー」に設定してください。</span></li>
                <li className="flex gap-2"><span className="text-primary">02</span><span>背景の色を反映させるため「背景のグラフィック」にチェックを入れてください。</span></li>
             </ul>
             <ul className="text-[10px] text-gray-500 font-bold space-y-3">
                <li className="flex gap-2"><span className="text-primary">03</span><span>用紙を A4 ポートレート(縦向き) に設定してください。</span></li>
                <li className="flex gap-2"><span className="text-primary">04</span><span>端が切れる場合は「倍率」を「ページに合わせる」に調整してください。</span></li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  )
}

