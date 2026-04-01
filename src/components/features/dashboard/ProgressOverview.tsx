'use client'

import { UserProfile } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, TrendingUp, ShieldCheck } from 'lucide-react'

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

export default function ProgressOverview({ profile, scoreData }: Props) {
  return (
    <div className="space-y-4">
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
        {/* Achievement */}
        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              業績
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-bold text-gray-800">{scoreData.achievementScore.toFixed(1)}</div>
            <p className="text-[10px] text-gray-400">Max 40pt</p>
          </CardContent>
        </Card>

        {/* Competency */}
        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-500" />
              能力
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-bold text-gray-800">{scoreData.competencyScore.toFixed(1)}</div>
            <p className="text-[10px] text-gray-400">Max 30pt</p>
          </CardContent>
        </Card>

        {/* Sentiment */}
        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-orange-500" />
              情意
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-bold text-gray-800">{scoreData.sentimentScore.toFixed(1)}</div>
            <p className="text-[10px] text-gray-400">Max 30pt</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
