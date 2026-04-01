'use client'

import { UserProfile } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, TrendingUp, ShieldCheck, Target, Brain, Heart, HelpCircle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  return (
    <div className="space-y-4">
      {/* ユーザー名や役職が必要ならここに {profile.fullName} とかを入れるが、今回は呼び出し元で表示しているので省略 */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Award className="w-24 h-24 text-primary" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">総合評価ランク</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="text-5xl font-black text-primary drop-shadow-sm">
              {scoreData.finalGrade}
            </div>
            <div className="text-2xl font-bold tracking-tighter text-gray-700 mb-1">
              {scoreData.totalScore.toFixed(1)} <span className="text-sm font-normal text-gray-500">/ 100 pt</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {/* 業績 (Achievement) */}
        <Dialog>
          <DialogTrigger render={
            <Card className="shadow-sm hover:border-blue-300 hover:bg-blue-50/10 cursor-pointer transition-all active:scale-95 group">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-semibold text-gray-500 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  業績
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-center md:text-left">
                <div className="text-lg font-bold text-gray-800">{scoreData.achievementScore.toFixed(1)}</div>
                <p className="text-[10px] text-gray-400">Max 40pt</p>
              </CardContent>
            </Card>
          } />
          <DialogContent className="max-w-[90vw] sm:max-w-md bg-blue-50/95 border-blue-200">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-blue-200">
                <Target className="text-white w-7 h-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-blue-900">業績 (Achievement)</DialogTitle>
              <DialogDescription className="text-blue-700 font-medium">成し遂げた成果を評価する</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-blue-900 leading-relaxed bg-white/70 p-4 rounded-xl border border-blue-100 shadow-sm font-medium">
                あらかじめ設定された目標（KPI）や、期待されるアウトプットに対してどの程度達成できたかを数値化します。
              </p>
              <div className="bg-white/50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  評価のポイント
                </h4>
                <ul className="text-xs text-blue-800 space-y-2.5">
                  <li className="flex gap-2">✓ <span className="font-medium">ケア目標の進捗率・達成度</span></li>
                  <li className="flex gap-2">✓ <span className="font-medium">記録の完遂・提出期限の遵守</span></li>
                  <li className="flex gap-2">✓ <span className="font-medium">事故防止成果、稼働への貢献</span></li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 能力 (Competency) */}
        <Dialog>
          <DialogTrigger render={
            <Card className="shadow-sm hover:border-emerald-300 hover:bg-emerald-50/10 cursor-pointer transition-all active:scale-95 group">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-semibold text-gray-500 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                  <Award className="w-3 h-3 text-emerald-500" />
                  能力
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-center md:text-left">
                <div className="text-lg font-bold text-gray-800">{scoreData.competencyScore.toFixed(1)}</div>
                <p className="text-[10px] text-gray-400">Max 30pt</p>
              </CardContent>
            </Card>
          } />
          <DialogContent className="max-w-[90vw] sm:max-w-md bg-emerald-50/95 border-emerald-200">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-emerald-200">
                <Brain className="text-white w-7 h-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-emerald-900">能力 (Ability)</DialogTitle>
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
                <ul className="text-xs text-emerald-800 space-y-2.5">
                  <li className="flex gap-2">✓ <span className="font-medium">確かな介護技術・専門知識</span></li>
                  <li className="flex gap-2">✓ <span className="font-medium">多職種間のチームワーク・調整</span></li>
                  <li className="flex gap-2">✓ <span className="font-medium">後輩への指導、適切な現場判断</span></li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 情意 (Sentiment) */}
        <Dialog>
          <DialogTrigger render={
            <Card className="shadow-sm hover:border-orange-300 hover:bg-orange-50/10 cursor-pointer transition-all active:scale-95 group">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-semibold text-gray-500 flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                  <ShieldCheck className="w-3 h-3 text-orange-500" />
                  情意
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-center md:text-left">
                <div className="text-lg font-bold text-gray-800">{scoreData.sentimentScore.toFixed(1)}</div>
                <p className="text-[10px] text-gray-400">Max 30pt</p>
              </CardContent>
            </Card>
          } />
          <DialogContent className="max-w-[90vw] sm:max-w-md bg-rose-50/95 border-rose-200">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-rose-200">
                <Heart className="text-white w-7 h-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-rose-900">情意 (Attitude)</DialogTitle>
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
                <ul className="text-xs text-rose-800 space-y-2.5">
                  <li className="flex gap-2">✓ <span className="font-medium">法人理念の実践、他者への誠実さ</span></li>
                  <li className="flex gap-2">✓ <span className="font-medium">責任感・規律維持・仕事への熱量</span></li>
                  <li className="flex gap-2">✓ <span className="font-medium">利用者様への深い配慮と尊厳守守</span></li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
