'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/use-profile'
import { isFiscalYearTransitionPeriod, getPreviousFiscalYear, getFiscalYearLabel } from '@/lib/utils/fiscal-year'
import Link from 'next/link'
import { clsx } from 'clsx'

export function FiscalTransitionAlert() {
  const { isSystemAdmin, isCorpAdmin, isFacilityManager, loading } = useProfile()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // 3月または4月かつ、管理者系ロールの場合のみ表示
    if (!loading && (isSystemAdmin || isCorpAdmin || isFacilityManager)) {
      if (isFiscalYearTransitionPeriod()) {
        setIsVisible(true)
      }
    }
  }, [loading, isSystemAdmin, isCorpAdmin, isFacilityManager])

  if (!isVisible || isDismissed) return null

  const previousYear = getPreviousFiscalYear()
  const previousYearLabel = getFiscalYearLabel(previousYear)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0, y: -20 }}
        animate={{ height: 'auto', opacity: 1, y: 0 }}
        exit={{ height: 0, opacity: 0, y: -20 }}
        className="overflow-hidden"
      >
        <div className="mb-6 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/80 backdrop-blur-xl border border-amber-100 rounded-[2rem] shadow-xl shadow-amber-500/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-amber-900 flex items-center gap-2">
                  年度切り替え時期の重要なお知らせ
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 uppercase tracking-tighter">
                    Action Required
                  </span>
                </h4>
                <p className="text-sm font-bold text-amber-800/70 leading-relaxed">
                  3月〜4月は年度の切り替え時期です。
                  <span className="text-amber-900 underline underline-offset-4 decoration-amber-300 font-black mx-1">
                    {previousYearLabel}
                  </span>
                  のスタッフ評価の確定をお願いします。
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsDismissed(true)}
                className="text-amber-700/50 hover:text-amber-700 hover:bg-amber-50 font-bold text-xs"
              >
                あとで
              </Button>
              <Link href="/admin/staff">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-6 py-5 h-auto rounded-xl shadow-lg shadow-amber-600/20 flex items-center gap-2 group/btn">
                  評価を確定する
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
