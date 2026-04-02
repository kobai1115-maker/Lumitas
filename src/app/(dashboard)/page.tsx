'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile, DashboardMetrics, ScoringResult } from '@/types'
import { supabase } from '@/lib/supabase'
import { CalendarDays, ChevronDown, History } from 'lucide-react'

import ProgressOverview from '@/components/features/dashboard/ProgressOverview'
import RoleBasedWidgets from '@/components/features/dashboard/RoleBasedWidgets'

// 年度ごとのモックデータ定義 (蓄積のシミュレーション)
const YEARLY_DATA: Record<string, { metrics: DashboardMetrics, scoreData: ScoringResult }> = {
  '2024': {
    metrics: { completionRate: 85, incidentReports: 2, skillLevel: 4 },
    scoreData: { achievementScore: 35.5, competencyScore: 24.0, sentimentScore: 28.5, totalScore: 88.0, finalGrade: 'A' }
  },
  '2025': {
    metrics: { completionRate: 92, incidentReports: 1, skillLevel: 5 },
    scoreData: { achievementScore: 38.0, competencyScore: 27.5, sentimentScore: 29.0, totalScore: 94.5, finalGrade: 'S' }
  },
  '2023': {
    metrics: { completionRate: 78, incidentReports: 4, skillLevel: 3 },
    scoreData: { achievementScore: 30.0, competencyScore: 20.0, sentimentScore: 25.0, totalScore: 75.0, finalGrade: 'B' }
  }
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [fiscalYear, setFiscalYear] = useState('2024')
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false)

  // 選択中の年度のデータを取得
  const currentData = YEARLY_DATA[fiscalYear] || YEARLY_DATA['2024']

  useEffect(() => {
    // 開発環境用の既定プロフィール設定 (本来はDBからIDで検索)
    setProfile({
      id: 'u1',
      email: 'yamada@example.com',
      fullName: '山田 理事長',
      role: 'ADMIN',
      positionId: 'p1',
      positionName: '理事長',
      departmentId: 'd1',
      departmentName: '役員会',
      gradeLevel: 7,
      welfarePoints: 1250,
    })
  }, [fiscalYear])

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-gray-500 font-bold tracking-widest text-xs uppercase">データを読み込んでいます...</div>
      </div>
    )
  }

  return (
    <motion.div 
      key={fiscalYear} // 年度切替時にアニメーションを再発生させる
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* ユーザーヘッダー & 年度セレクター */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">
            こんにちは、{profile.fullName} さん
          </h1>
          <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
            <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-gray-500">{profile.departmentName}</span>
            <span>等級: {profile.gradeLevel}</span>
          </div>
        </div>

        {/* 年度切り替えスイッチ (Premium UI) */}
        <div className="relative">
          <button 
            onClick={() => setIsYearSelectorOpen(!isYearSelectorOpen)}
            className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 group ring-primary/5 hover:ring-8"
          >
            <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">表示対象年度</p>
              <span className="text-sm font-black text-gray-700">{fiscalYear}年度</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isYearSelectorOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isYearSelectorOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 overflow-hidden"
              >
                <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">年度の切り替え</p>
                {Object.keys(YEARLY_DATA).sort((a, b) => b.localeCompare(a)).map((year) => (
                  <button
                    key={year}
                    onClick={() => { setFiscalYear(year); setIsYearSelectorOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black transition-all ${
                      fiscalYear === year 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                      : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span>{year}年度</span>
                    {fiscalYear === year && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                  </button>
                ))}
                <div className="border-t border-gray-50 mt-2 pt-2 px-2 pb-1">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold px-2 uppercase tracking-tighter">
                    <History className="w-3 h-3" />
                    過去の蓄積データ
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ProgressOverview profile={profile} scoreData={currentData.scoreData} />
      
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 tracking-tight flex items-center gap-2">
          {fiscalYear}年度の重点目標・取り組み状況
        </h2>
        <RoleBasedWidgets role={profile.role} metrics={currentData.metrics} />
      </div>
    </motion.div>
  )
}

