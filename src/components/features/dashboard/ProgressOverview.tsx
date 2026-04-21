'use client'

import { UserProfile } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, TrendingUp, Target, Brain, Heart } from 'lucide-react'
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
import { clsx } from 'clsx'

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
  // レーダーチャート用データ (Max値を考慮して正規化)
  const chartData = [
    { subject: '業績', A: scoreData.achievementScore, fullMark: 40 },
    { subject: '能力', A: (scoreData.competencyScore / 30) * 40, fullMark: 40 },
    { subject: '情意', A: (scoreData.sentimentScore / 30) * 40, fullMark: 40 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* 評価ランクカード (左側 2列分) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card className="flex-1 bg-gradient-to-br from-indigo-500 via-primary to-purple-600 border-none shadow-xl overflow-hidden relative group">
            {/* 背景の装飾文字 */}
            <div className="absolute -bottom-6 -right-6 text-[120px] font-black text-white/10 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
              {scoreData.finalGrade}
            </div>
            
            <CardHeader className="pb-0">
              <CardTitle className="text-xs font-bold text-white/70 uppercase tracking-[0.2em]">現在の総合評価</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col">
                <div className="text-7xl font-black text-white drop-shadow-lg mb-2">
                  {scoreData.finalGrade}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${scoreData.totalScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    />
                  </div>
                  <span className="text-lg font-black text-white">{scoreData.totalScore.toFixed(1)} <span className="text-[10px] font-medium opacity-70">pt</span></span>
                </div>
                <p className="text-[10px] text-white/60 mt-4 font-bold tracking-widest uppercase">
                  最終グレード確定までの進捗
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* レーダーチャート (右側 3列分) */}
        <Card className="md:col-span-3 shadow-xl border-gray-100/50 bg-white/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-0 border-b border-gray-50 bg-gray-50/30">
            <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              スキルバランス分析
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center justify-center">
            <div className="w-full h-[240px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 40]} tick={false} axisLine={false} />
                  <Radar
                    name="スコア"
                    dataKey="A"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#radarGradient)"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* 以下、Dialog部分 */}
        {/* 業績 */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="shadow-md hover:ring-2 hover:ring-blue-500/20 hover:bg-blue-50/10 cursor-pointer transition-all active:scale-95 group border-gray-100">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-[10px] font-black text-gray-400 flex items-center gap-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  業績
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-black text-gray-800">{scoreData.achievementScore.toFixed(1)}</div>
                <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(scoreData.achievementScore / 40) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-md bg-blue-50/95 border-blue-200 backdrop-blur-md">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-blue-200">
                <Target className="text-white w-7 h-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-blue-900 tracking-tight">業績 (Achievement)</DialogTitle>
              <DialogDescription className="text-blue-700 font-medium">成し遂げた成果を評価する</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-blue-900 leading-relaxed bg-white/70 p-4 rounded-xl border border-blue-100 shadow-sm font-medium">
                あらかじめ設定された「重点目標」や、期待されるアウトプットに対してどの程度達成できたかを数値化します。
              </p>
              <div className="bg-white/50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  評価のポイント
                </h4>
                <ul className="text-xs text-blue-800 space-y-2.5 font-medium">
                  <li className="flex gap-2">✓ ケア目標の進捗率・達成度</li>
                  <li className="flex gap-2">✓ 記録の完遂・提出期限の遵守</li>
                  <li className="flex gap-2">✓ 事故防止成果、稼働への貢献</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 能力 */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="shadow-md hover:ring-2 hover:ring-emerald-500/20 hover:bg-emerald-50/10 cursor-pointer transition-all active:scale-95 group border-gray-100">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-[10px] font-black text-gray-400 flex items-center gap-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                  <Award className="w-3 h-3 text-emerald-500" />
                  能力
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-black text-gray-800">{scoreData.competencyScore.toFixed(1)}</div>
                <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(scoreData.competencyScore / 30) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-md bg-emerald-50/95 border-emerald-200 backdrop-blur-md">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-emerald-200">
                <Brain className="text-white w-7 h-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-emerald-900 tracking-tight">能力 (Ability)</DialogTitle>
              <DialogDescription className="text-emerald-700 font-medium">発揮した力と専門技術を評価する</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-emerald-900 leading-relaxed bg-white/70 p-4 rounded-xl border border-emerald-100 shadow-sm font-medium">
                仕事を行ううえで必要とされる知識、スキル、行動がどの程度発揮されたかを見極めます。
              </p>
              <div className="bg-white/50 p-4 rounded-xl border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-800 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  評価のポイント
                </h4>
                <ul className="text-xs text-emerald-800 space-y-2.5 font-medium">
                  <li className="flex gap-2">✓ 確かな介護技術・専門知識</li>
                  <li className="flex gap-2">✓ 多職種間のチームワーク・調整</li>
                  <li className="flex gap-2">✓ 後輩への指導、適切な現場判断</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 情意 */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="shadow-md hover:ring-2 hover:ring-rose-500/20 hover:bg-rose-50/10 cursor-pointer transition-all active:scale-95 group border-gray-100">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-[10px] font-black text-gray-400 flex items-center gap-1 group-hover:text-rose-600 transition-colors uppercase tracking-tight">
                  <Heart className="w-3 h-3 text-rose-500" />
                  情意
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-black text-gray-800">{scoreData.sentimentScore.toFixed(1)}</div>
                <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${(scoreData.sentimentScore / 30) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-md bg-rose-50/95 border-rose-200 backdrop-blur-md">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-rose-200">
                <Heart className="text-white w-7 h-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-rose-900 tracking-tight">情意 (Attitude)</DialogTitle>
              <DialogDescription className="text-rose-700 font-medium">働く姿勢と想いを評価する</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-rose-900 leading-relaxed bg-white/70 p-4 rounded-xl border border-rose-100 shadow-sm font-medium">
                仕事に対する積極性、誠実さ、価値観への共鳴など、数字に表れにくい「マインド」面を重視します。
              </p>
              <div className="bg-white/50 p-4 rounded-xl border border-rose-100">
                <h4 className="text-xs font-bold text-rose-800 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  評価のポイント
                </h4>
                <ul className="text-xs text-rose-800 space-y-2.5 font-medium">
                  <li className="flex gap-2">✓ 法人理念の実践、他者への誠実さ</li>
                  <li className="flex gap-2">✓ 責任感・規律維持・仕事への熱量</li>
                  <li className="flex gap-2">✓ 利用者様への深い配慮と尊厳守守</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
