'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Crosshair, Users, Activity, HelpCircle, Target, Brain, Heart } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// 今回の評価項目：技術、コミュニケーション、安全配慮、リーダーシップ、倫理など
const COMPETENCY_ITEMS = [
  { id: 'tech', label: '専門スキル・技術', icon: Activity, desc: '排泄・入浴・移乗等の介護技術や各種記録の正確性' },
  { id: 'comm', label: '対人コミュニケーション', icon: Users, desc: '利用者・職員・家族に対する丁寧な傾聴と適切な対応' },
  { id: 'safe', label: '安全配慮・リスク管理', icon: ShieldCheck, desc: '事故予防への意識やヒヤリハット報告の積極性' },
  { id: 'lead', label: '協調性・チームワーク', icon: Crosshair, desc: '全体の状況把握、他のスタッフへの声かけやフォロー' }
]

export default function CompetencySlider() {
  const [scores, setScores] = useState<Record<string, number>>({
    tech: 3, comm: 3, safe: 3, lead: 3
  })

  const handleChange = (id: string, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-gray-800 text-lg">コンピテンシー自己評価</h3>
        <Dialog>
          <DialogTrigger
            render={
              <button className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-xs font-bold bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
                <HelpCircle className="w-4 h-4" />
                評価ガイド
              </button>
            }
          />
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                人事考課の3要素
              </DialogTitle>
              <DialogDescription>
                評価を付ける際の参考にしてください。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <section className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-4">
                <Target className="w-10 h-10 text-blue-500 shrink-0" />
                <div className="space-y-1.5">
                  <h4 className="font-bold text-blue-900 border-b border-blue-200 pb-1 flex items-center gap-2">
                    業績（ぎょうせき）
                  </h4>
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">個人や組織で「成し遂げた成果」を評価します。</p>
                  <ul className="text-[10px] text-blue-700/80 list-disc list-inside space-y-0.5">
                    <li>目標達成度・記録の完遂数</li>
                    <li>重大事故の未然防止成果</li>
                  </ul>
                </div>
              </section>

              <section className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex gap-4">
                <Brain className="w-10 h-10 text-emerald-500 shrink-0" />
                <div className="space-y-1.5">
                  <h4 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1">能力・成績（せいせき）</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">仕事に必要な「知識・技術」の発揮度を評価します。</p>
                  <ul className="text-[10px] text-emerald-700/80 list-disc list-inside space-y-0.5">
                    <li>介助スキル・記録の正確性</li>
                    <li>他職種連携・リーダーシップ</li>
                  </ul>
                </div>
              </section>

              <section className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex gap-4">
                <Heart className="w-10 h-10 text-rose-500 shrink-0" />
                <div className="space-y-1.5">
                  <h4 className="font-bold text-rose-900 border-b border-rose-200 pb-1">情意（じょうい）</h4>
                  <p className="text-xs text-rose-800 leading-relaxed font-medium">「仕事への姿勢・意欲」を評価します。</p>
                  <ul className="text-[10px] text-rose-700/80 list-disc list-inside space-y-0.5">
                    <li>責任感・規律維持・協調性</li>
                    <li>利用者への配慮・誠実な態度</li>
                  </ul>
                </div>
              </section>

              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                  本システムではAIがあなたの日常の「できたこと・気づき」を拾い上げ、
                  これら3要素の客観的な蓄積をサポートします。
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {COMPETENCY_ITEMS.map((item) => {
        const Icon = item.icon
        const val = scores[item.id]
        
        // 値に応じて色やラベルを変える（1-5段階）
        const color = val >= 4 ? 'bg-primary' : val <= 2 ? 'bg-orange-500' : 'bg-blue-400'
        const label = val === 5 ? '超越' : val === 4 ? '優秀' : val === 3 ? '標準' : val === 2 ? '要努力' : '改善必須'

        return (
          <Card key={item.id} className="shadow-sm border border-gray-100 overflow-hidden group">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center relative">
              
              <div className="flex-1 w-full flex items-center gap-3 min-w-48">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-primary/5 transition-colors">
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 leading-none">{item.label}</h4>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">{item.desc}</p>
                </div>
              </div>

              <div className="flex flex-col w-full md:w-64 gap-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-medium text-gray-500">Lv.1</span>
                  <div className="flex gap-2 items-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm transition-colors ${color}`}>
                      {label}
                    </span>
                    <span className="text-xl font-black text-gray-800 tracking-tighter tabular-nums w-4 text-center">
                      {val}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">Lv.5</span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={val}
                  onChange={(e) => handleChange(item.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  style={{
                    background: `linear-gradient(to right, ${val >= 4 ? '#10b981' : val >= 3 ? '#3b82f6' : '#f59e0b'} 0%, ${val >= 4 ? '#10b981' : val >= 3 ? '#3b82f6' : '#f59e0b'} ${(val - 1) * 25}%, #e5e7eb ${(val - 1) * 25}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              
            </CardContent>
          </Card>
        )
      })}
      
      <p className="text-[10px] text-center text-gray-400 mt-4">
        ※毎月の面談前に、自身の感覚を入力してください。自動的に上長の閲覧画面に反映されます。
      </p>
    </div>
  )
}
