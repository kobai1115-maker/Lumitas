'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile, DashboardMetrics, ScoringResult } from '@/types'
import { CalendarDays, ChevronDown, History } from 'lucide-react'

import ProgressOverview from '@/components/features/dashboard/ProgressOverview'
import RoleBasedWidgets from '@/components/features/dashboard/RoleBasedWidgets'
import { FiscalTransitionAlert } from '@/components/features/dashboard/FiscalTransitionAlert'
import { useProfile } from '@/hooks/use-profile'
import { getAvailableFiscalYears, getFiscalYear, getFiscalYearLabel } from '@/lib/utils/fiscal-year'

// 年度ごとのモックデータ定義 (2026年度からに更新)
const YEARLY_DATA: Record<string, { metrics: DashboardMetrics, scoreData: ScoringResult }> = {
  '2026': {
    metrics: { completionRate: 92, incidentReports: 1, skillLevel: 5 },
    scoreData: { achievementScore: 38.0, competencyScore: 27.5, sentimentScore: 29.0, totalScore: 94.5, finalGrade: 'S' }
  },
  '2027': {
    metrics: { completionRate: 0, incidentReports: 0, skillLevel: 5 },
    scoreData: { achievementScore: 0, competencyScore: 0, sentimentScore: 0, totalScore: 0, finalGrade: 'A' }
  }
}

export default function DashboardPage() {
  const { profile, loading } = useProfile()
  const currentYear = getFiscalYear().toString()
  const [fiscalYear, setFiscalYear] = useState(currentYear)
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false)

  // 選択可能な年度リストを動的に取得
  const availableYears = useMemo(() => getAvailableFiscalYears(1), []) // 未来1年分まで表示

  // 選択中の年度のデータ取得 (データがない場合は現在の年度のスケルトンまたは2026年分を流用)
  const currentData = useMemo(() => {
    return YEARLY_DATA[fiscalYear] || YEARLY_DATA['2026']
  }, [fiscalYear])

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-gray-500 font-bold tracking-widest text-xs uppercase">データを読み込んでいます...</div>
      </div>
    )
  }

  return (
    <motion.div 
      key={fiscalYear} 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <FiscalTransitionAlert />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">
            こんにちは、{profile.fullName} さん
          </h1>
          <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
            <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-gray-500">{profile.unitName || profile.department}</span>
            <span>等級: {profile.gradeLevel}</span>
          </div>
        </div>

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
              <span className="text-sm font-black text-gray-700">{getFiscalYearLabel(fiscalYear)}</span>
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
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => { setFiscalYear(year); setIsYearSelectorOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black transition-all ${
                      fiscalYear === year 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                      : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span>{getFiscalYearLabel(year)}</span>
                    {fiscalYear === year && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                  </button>
                ))}
                <div className="border-t border-gray-50 mt-2 pt-2 px-2 pb-1">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold px-2 uppercase tracking-tighter">
                    <History className="w-3 h-3" />
                    システム稼働開始: 2026年度
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
          {getFiscalYearLabel(fiscalYear)}の重点目標・取り組み状況
        </h2>
        <RoleBasedWidgets role={profile.role} metrics={currentData.metrics} />
      </div>
    </motion.div>
  )
}
