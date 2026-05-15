'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile, DashboardMetrics, ScoringResult } from '@/types'
import { 
  CalendarDays, 
  ChevronDown, 
  History, 
  Shield, 
  Sparkles, 
  Award, 
  RefreshCw, 
  MessageSquare, 
  AlertTriangle,
  ShieldCheck,
  UserPlus,
  FileText,
  TrendingUp,
  Info,
  ArrowUpRight,
  Clock
} from 'lucide-react'

import ProgressOverview from '@/components/features/dashboard/ProgressOverview'
import RoleBasedWidgets from '@/components/features/dashboard/RoleBasedWidgets'
import { FiscalTransitionAlert } from '@/components/features/dashboard/FiscalTransitionAlert'
import { useProfile } from '@/hooks/use-profile'
import { getAvailableFiscalYears, getFiscalYear, getFiscalYearLabel } from '@/lib/utils/fiscal-year'
import VoiceIncidentForm from '@/components/features/incident/VoiceIncidentForm'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile()
  const currentYear = getFiscalYear().toString()
  const [fiscalYear, setFiscalYear] = useState(currentYear)
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false)
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [scoreData, setScoreData] = useState<ScoringResult | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)

  const availableYears = useMemo(() => getAvailableFiscalYears(1), []) 

  const fetchMetrics = async (year: string) => {
    setMetricsLoading(true)
    try {
      const res = await fetch(`/api/dashboard/metrics?year=${year}`)
      if (!res.ok) throw new Error('Failed to fetch metrics')
      const data = await res.json()
      setMetrics(data.metrics)
      setScoreData(data.scoreData)
    } catch (err) {
      console.error('Fetch metrics error:', err)
    } finally {
      setMetricsLoading(false)
    }
  }

  useEffect(() => {
    if (profile) {
      fetchMetrics(fiscalYear)
    }
  }, [profile, fiscalYear])

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="animate-pulse text-slate-400 font-black tracking-widest text-[10px] uppercase">分析データを読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center bg-slate-50">
        <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mb-2 shadow-xl border border-slate-100">
          <Shield className="w-10 h-10 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-slate-900 font-black text-2xl tracking-tight">アクセス拒否</h2>
          <p className="text-slate-500 text-sm font-bold leading-relaxed max-w-xs">
            認証プロファイルが見つかりません。
          </p>
        </div>
        <Button onClick={() => window.location.reload()} className="h-14 px-10 bg-blue-600 text-white font-black rounded-2xl shadow-lg">
          再読み込み
        </Button>
      </div>
    )
  }

  const displayMetrics = metrics || { completionRate: 0, incidentReports: 0, skillLevel: 0 }
  const displayScoreData = scoreData || { achievementScore: 0, competencyScore: 0, sentimentScore: 0, totalScore: 0, finalGrade: 'C' as const }

  return (
    <div className="min-h-screen bg-[#f1f5f9] relative overflow-hidden pb-20 font-sans">
      {/* 
        デザインガイドブック 4.3 準拠: 
        デジタル庁Blue系統 (#4979F5) をベースにした、信頼感のある配色
      */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-slate-900 to-slate-800 z-0" />
      
      <div className="relative z-10 p-6 lg:p-12 max-w-[1600px] mx-auto">
        <FiscalTransitionAlert />

        {/* Dashboard Header */}
        <header className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-8 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg mb-4 border border-blue-500/30">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">業務状況分析</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2">
              {profile.fullName} <span className="text-slate-400 font-medium text-2xl ml-2">様</span>
            </h1>
            <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>最終更新: {new Date().toLocaleDateString('ja-JP')} 09:00</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>{profile.unitName || profile.department}</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <button 
                onClick={() => setIsYearSelectorOpen(!isYearSelectorOpen)}
                className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-md border border-slate-700 px-6 py-4 rounded-2xl shadow-xl hover:bg-slate-700 transition-all group"
              >
                <CalendarDays className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">対象年度</p>
                  <span className="text-lg font-black text-white">{getFiscalYearLabel(fiscalYear)}</span>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform duration-300", isYearSelectorOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isYearSelectorOpen && (
                  <motion.div 
                    key="year-selector-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-3 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                  >
                    {availableYears.map((year) => (
                      <button
                        key={`fy-${year}`}
                        onClick={() => { setFiscalYear(year); setIsYearSelectorOpen(false); }}
                        className={cn(
                          "w-full flex items-center justify-between px-5 py-3 rounded-xl text-sm font-black transition-all mb-1",
                          fiscalYear === year ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
                        )}
                      >
                        <span>{getFiscalYearLabel(year)}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </header>

        {/* 
          Main Content Sections:
          最上部に全体サマリーを配置し、赤枠の縦長問題を解消
        */}
        <div className="space-y-10">
          
          {/* TOP: 評価サマリー (全幅) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6 px-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">個人評価・スキル要約</h3>
            </div>
            <ProgressOverview profile={profile} scoreData={displayScoreData} />
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT: 主要指標とアクション (8カラム) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* 主要KPIカード */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    label: '目標達成率', 
                    value: `${displayMetrics.completionRate}%`, 
                    sub: '先月比 +2.4%', 
                    icon: TrendingUp, 
                    color: 'text-blue-600', 
                    bg: 'bg-blue-50',
                    info: '個人目標の平均達成率です'
                  },
                  { 
                    label: '報告件数', 
                    value: displayMetrics.incidentReports, 
                    sub: '平均比 +12%', 
                    icon: MessageSquare, 
                    color: 'text-emerald-600', 
                    bg: 'bg-emerald-50',
                    info: 'ヒヤリハット・グッドキャッチの累計報告数'
                  },
                  { 
                    label: '獲得ポイント', 
                    value: displayScoreData.totalScore.toLocaleString(), 
                    sub: '獲得順位: 4位', 
                    icon: Award, 
                    color: 'text-orange-600', 
                    bg: 'bg-orange-50',
                    info: 'ポジティブな行動に対するAI評価の合計点'
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={`stat-${stat.label}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <Info className="w-4 h-4 text-slate-300" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        {stat.sub}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* アクションエリア: 音声インシデント報告 */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-slate-200 rounded-[32px] p-1 shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">AI 安全・改善記録センター</h2>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 uppercase">
                    AI解析システム稼働中
                  </span>
                </div>
                <div className="p-8">
                  <VoiceIncidentForm />
                </div>
              </motion.section>

              {/* 詳細分析: RoleBasedWidgets */}
              <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm"
              >
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">指標詳細分析</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">職位・役割に基づいた個別パフォーマンス指標</p>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">
                    表示データ: {fiscalYear}年度
                  </div>
                </div>
                <RoleBasedWidgets role={profile.role} metrics={displayMetrics} isLoading={metricsLoading} />
              </motion.section>
            </div>

            {/* RIGHT: 補足情報と状況把握 (4カラム) */}
            <div className="lg:col-span-4 space-y-10">
              
              {/* AI Insights */}
              <motion.div 
                className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800"
              >
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <TrendingUp className="w-40 h-40" />
                </div>
                <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  AI 状況インサイト
                </h3>
                <div className="space-y-4 relative z-10">
                  {[
                    { text: "今週のヒヤリハット報告の質が向上しています。再発防止策の具体性が高まっています。", type: "positive" },
                    { text: "夜間帯の巡回記録に15分の遅延傾向が見られます。人員配置の確認を推奨します。", type: "neutral" },
                  ].map((insight, i) => (
                    <div key={`insight-${i}`} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                      <p className="text-xs font-bold leading-relaxed text-slate-300">{insight.text}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl h-14 shadow-lg border-none">
                  詳細レポートを開く
                </Button>
              </motion.div>

              {/* クイックアクセス */}
              <div className="space-y-4 px-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">クイックアクセス</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'スタッフ登録', icon: UserPlus },
                    { label: '記録一覧', icon: FileText },
                  ].map((action, i) => (
                    <motion.button
                      key={`action-${i}`}
                      whileHover={{ scale: 1.02 }}
                      className="h-24 rounded-3xl border border-slate-200 bg-white flex flex-col items-center justify-center gap-2 font-black text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                    >
                      <action.icon className="w-5 h-5" />
                      <span className="text-[10px]">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* メタ情報 */}
              <div className="px-6 py-8 border-t border-slate-200 mt-10">
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
                  ※表示データは {new Date().toLocaleDateString('ja-JP')} 時点の集計結果です。<br />
                  ※AIスコアリングは Gemini-1.5 モデルによって算出されています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
