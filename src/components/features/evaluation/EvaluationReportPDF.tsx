'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, BarChart3, MessageSquare, Award, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const RadarChart = dynamic(() => import('recharts').then(mod => mod.RadarChart), { ssr: false })
const Radar = dynamic(() => import('recharts').then(mod => mod.Radar), { ssr: false })
const PolarGrid = dynamic(() => import('recharts').then(mod => mod.PolarGrid), { ssr: false })
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => mod.PolarAngleAxis), { ssr: false })

type Props = {
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
  generatedDocId: string
  todayDate: string
}

export default function EvaluationReportPDF({ staff, metrics, aiComment, corpName, locationName, generatedDocId, todayDate }: Props) {
  const chartData = [
    { subject: '業績達成率', A: metrics.achievement, fullMark: 100 },
    { subject: '職務能力', A: metrics.competency, fullMark: 100 },
    { subject: '情意・姿勢', A: metrics.sentiment, fullMark: 100 },
    { subject: '専門スキル', A: metrics.skills, fullMark: 100 },
    { subject: '組織貢献', A: metrics.team, fullMark: 100 },
  ]

  return (
    <div className="a4-container text-[#1a1a1a] bg-white relative overflow-hidden font-sans">
      {/* プレミアム背景アクセント */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/3 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />

      {/* ヘッダーセクション (エコ仕様: 境界線を淡くしてトナー節約) */}
      <header className="relative z-10 border-b border-gray-100 pb-8 mb-10 flex justify-between items-start">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-1">{corpName}</p>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              人事評価報告書
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-bold">
              <Building2 className="w-3.5 h-3.5" />
              {locationName}
            </div>
            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              発行日: {todayDate}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">評価対象者</p>
            <h2 className="text-2xl font-black text-gray-900 mb-0.5">{staff.fullName} <span className="text-sm font-bold text-gray-400">様</span></h2>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-black text-gray-600 px-2 py-0.5 bg-white border border-gray-100 rounded-md shadow-sm">{staff.positionName}</span>
              <span className="text-[10px] font-bold text-gray-400">{staff.departmentName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* メイングリッドエリア */}
      <div className="grid grid-cols-12 gap-10">
        {/* 左カラム: ビジュアルサマリー */}
        <div className="col-span-12 lg:col-span-5 space-y-10 focus:outline-none">
          {/* レーダーチャート */}
          <div className="relative p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              評価バランス分析
            </h3>
            <div className="h-[280px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#f3f4f6" strokeWidth={1} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#4b5563', fontSize: 9, fontWeight: 900 }} 
                  />
                  <Radar
                    name="スコア"
                    dataKey="A"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="#10b981"
                    fillOpacity={0.15}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute top-6 right-6 opacity-5">
              <Award className="w-16 h-16" />
            </div>
          </div>

          {/* スコアリスト */}
          <div className="grid gap-2 text-primary">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 mb-1">評価項目別スコア</h3>
            {[
              { label: '業績達成度', score: metrics.achievement, desc: '設定された目標に対する完遂度' },
              { label: '専門職務能力', score: metrics.competency, desc: '介護技術および業務知識の習熟' },
              { label: '情意評価', score: metrics.sentiment, desc: '勤務態度、責任感、協調性' }
            ].map((item, i) => (
              <div key={i} className="group p-4 bg-gray-50/50 hover:bg-white border-transparent hover:border-gray-100 border rounded-2xl transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-black text-gray-800">{item.label}</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black text-gray-900">{item.score}</span>
                    <span className="text-[9px] font-bold text-gray-400">/ 100</span>
                  </div>
                </div>
                <p className="text-[9px] font-bold text-gray-400 leading-none">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 右カラム: AI評価詳細 (エコ仕様: 白背景に細い枠線でトナーを節約) */}
        <div className="col-span-12 lg:col-span-7 focus:outline-none">
          <div className="h-full flex flex-col p-8 bg-white rounded-[2rem] text-gray-900 relative border-2 border-gray-100 shadow-xl">
            {/* 装飾: AIの透明感 */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-primary">
              <MessageSquare className="w-24 h-24 stroke-[1px]" />
            </div>

            <header className="mb-6">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black px-3 py-1 rounded-full mb-3 shadow-none">
                AI 評価解析ステータス
              </Badge>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                今期の総評およびフィードバック
              </h3>
            </header>

            <div className="flex-1">
              <p className="text-sm font-bold leading-[1.8] text-gray-700 indent-4 whitespace-pre-wrap">
                {aiComment}
              </p>
            </div>

            {/* 管理者署名欄（アナログとデジタルの融合） */}
            <div className="mt-10 pt-8 border-t border-gray-50">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">検印・承認欄</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-gray-400">署名</p>
                  <div className="h-12 border border-gray-100 rounded-xl bg-gray-50/50 flex items-end justify-center pb-2">
                    <p className="text-[8px] italic text-gray-300 font-bold">(自筆署名欄)</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-gray-400">捺印</p>
                  <div className="h-12 w-12 border border-gray-100 rounded-xl bg-gray-50/50 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フッターセクション */}
      <footer className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-8">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">習熟グレード</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900">{staff.gradeLevel}</span>
              <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-500 font-black">習熟グレード</Badge>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">次期評価時期</p>
            <p className="text-sm font-black text-gray-800">2026年9月予定</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black text-gray-300 leading-none mb-1 tracking-tighter uppercase">文書管理ID: {generatedDocId}</p>
          <div className="flex items-center justify-end gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
             <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
             <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
             <p className="text-[9px] font-black text-primary ml-1 uppercase">ルミタスAI評価システムにより自動生成</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

