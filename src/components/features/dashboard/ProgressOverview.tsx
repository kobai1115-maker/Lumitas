'use client'

import { UserProfile } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, TrendingUp, Target, Brain, Heart, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const RadarChart = dynamic(() => import('recharts').then(mod => mod.RadarChart), { ssr: false })
const Radar = dynamic(() => import('recharts').then(mod => mod.Radar), { ssr: false })
const PolarGrid = dynamic(() => import('recharts').then(mod => mod.PolarGrid), { ssr: false })
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => mod.PolarAngleAxis), { ssr: false })
const PolarRadiusAxis = dynamic(() => import('recharts').then(mod => mod.PolarRadiusAxis), { ssr: false })

type ScoreData = {
  achievementScore: number
  competencyScore: number
  sentimentScore: number
  totalScore: number
  finalGrade: 'S'|'A'|'B'|'C'|'D'
}

type Props = {
  profile: UserProfile
  scoreData: ScoreData
}

export default function ProgressOverview({ scoreData }: Props) {
  // レーダーチャート用データ
  const chartData = [
    { subject: '業績評価', A: scoreData.achievementScore, fullMark: 40 },
    { subject: '能力評価', A: (scoreData.competencyScore / 30) * 40, fullMark: 40 },
    { subject: '情意評価', A: (scoreData.sentimentScore / 30) * 40, fullMark: 40 },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 評価ランクカード */}
        <div className="lg:col-span-2">
          <Card className="h-full bg-gradient-to-br from-indigo-600 via-primary to-purple-700 border-none shadow-2xl overflow-hidden relative group rounded-[2rem]">
            {/* 背景の装飾文字 */}
            <div className="absolute -bottom-6 -right-6 text-[140px] font-black text-white/10 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
              {scoreData.finalGrade}
            </div>
            
            <CardHeader className="pb-0 relative z-10">
              <CardTitle className="text-xs font-bold text-white/70 uppercase tracking-[0.2em]">現在の総合評価ランク</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <div className="flex flex-col">
                <div className="text-8xl font-black text-white drop-shadow-2xl mb-4">
                  {scoreData.finalGrade}
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${scoreData.totalScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"
                    />
                  </div>
                  <span className="text-2xl font-black text-white">{scoreData.totalScore.toFixed(1)} <span className="text-xs font-medium opacity-70">pt</span></span>
                </div>
                <p className="text-[10px] text-white/60 mt-6 font-black tracking-widest uppercase">
                  最終グレード確定までの進捗
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* レーダーチャート */}
        <Card className="lg:col-span-3 shadow-xl border-slate-100 bg-slate-50/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
          <CardHeader className="pb-0 border-b border-slate-100 bg-white/50">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              スキルバランス・特性分析
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-center">
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="4 4" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 900 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 40]} tick={false} axisLine={false} />
                  <Radar
                    name="スコア"
                    dataKey="A"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fill="url(#radarGradient)"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 業績評価 */}
        <Dialog key="dialog-achievement">
          <DialogTrigger render={
            <button className="text-left w-full group">
              <Card className="shadow-sm border-slate-100 hover:border-blue-500/50 hover:bg-blue-50/30 transition-all active:scale-95 rounded-2xl overflow-hidden">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">業績評価</p>
                      <div className="text-2xl font-black text-slate-900">{scoreData.achievementScore.toFixed(1)}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </button>
          } />
          <DialogContent className="max-w-[90vw] sm:max-w-md bg-white border-slate-200 rounded-[2rem] shadow-2xl">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-200">
                <Target className="text-white w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">業績評価</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold">成し遂げた成果を評価する</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl font-medium border border-slate-100">
                設定された「重点目標」や、期待されるアウトプットに対する達成度を可視化します。
              </p>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  評価のポイント
                </h4>
                <ul className="grid grid-cols-1 gap-2">
                  {['ケア目標の進捗・達成度', '記録の完遂・提出期限', '事故防止・稼働貢献'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                         <ChevronRight className="w-3 h-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 能力評価 */}
        <Dialog key="dialog-competency">
          <DialogTrigger render={
            <button className="text-left w-full group">
              <Card className="shadow-sm border-slate-100 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all active:scale-95 rounded-2xl overflow-hidden">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">能力評価</p>
                      <div className="text-2xl font-black text-slate-900">{scoreData.competencyScore.toFixed(1)}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </button>
          } />
          <DialogContent className="max-w-[90vw] sm:max-w-md bg-white border-slate-200 rounded-[2rem] shadow-2xl">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-emerald-200">
                <Award className="text-white w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">能力評価</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold">発揮した専門技術と力を評価する</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl font-medium border border-slate-100">
                業務知識、専門スキル、および現場での行動力を評価します。
              </p>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  評価のポイント
                </h4>
                <ul className="grid grid-cols-1 gap-2">
                  {['介護技術・専門知識', 'チーム連携・調整力', '後輩指導・現場判断'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <ChevronRight className="w-3 h-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 情意評価 */}
        <Dialog key="dialog-sentiment">
          <DialogTrigger render={
            <button className="text-left w-full group">
              <Card className="shadow-sm border-slate-100 hover:border-rose-500/50 hover:bg-rose-50/30 transition-all active:scale-95 rounded-2xl overflow-hidden">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">情意評価</p>
                      <div className="text-2xl font-black text-slate-900">{scoreData.sentimentScore.toFixed(1)}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </button>
          } />
          <DialogContent className="max-w-[90vw] sm:max-w-md bg-white border-slate-200 rounded-[2rem] shadow-2xl">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-rose-200">
                <Heart className="text-white w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">情意評価</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold">働く姿勢と想いを評価する</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl font-medium border border-slate-100">
                理念への共鳴、責任感、他者への誠実さといったマインド面を評価します。
              </p>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  評価のポイント
                </h4>
                <ul className="grid grid-cols-1 gap-2">
                  {['法人理念の実践・誠実さ', '責任感・規律・意欲', '利用者様への配慮'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                      <div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                         <ChevronRight className="w-3 h-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
