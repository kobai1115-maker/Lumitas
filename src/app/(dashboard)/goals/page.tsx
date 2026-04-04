'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, CheckCircle2, Loader2, Plus, X, Flag, Edit2, Sparkles, TrendingUp, Calendar, CalendarDays, Award } from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type Goal = {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit: string
  gradeLevel: number
  experienceYears: number
  yearsOfService: number
  welfarePoints: number
  superiorId?: string
  periodKey: string
  isAchieved: boolean
  deadline?: string | Date
  type: 'DAILY' | 'EVENT' | 'YEARLY'
  aiAlignmentNote?: string
}

// -------------------------------------------------------------
// Career Level Types & Suggestions
// -------------------------------------------------------------
type CareerLevel = 'NEWCOMER' | 'MID' | 'EXPERT'

const GOAL_SUGGESTIONS = {
  NEWCOMER: {
    DAILY: "例：笑顔を絶やさず、利用者様一人ひとりと挨拶を交わす",
    EVENT: "例：車椅子からベッドへの移乗介助を、一人でスムーズに行えるようになる",
    YEARLY: "例：介護職員初任者研修を完全に修了し、基本をマスターする"
  },
  MID: {
    DAILY: "例：1日1回、後輩の介助を見守りポジティブなフィードバックを行う",
    EVENT: "例：ユニットの業務フローを見直し、30分の時間短縮を図る",
    YEARLY: "例：介護福祉士の国家資格に合格し、専門性を高める"
  },
  EXPERT: {
    DAILY: "例：スタッフ一人ひとりの健康状態に気を配り、良好なチーム作りをリードする",
    EVENT: "例：ユニット全体のインシデント発生率を、前年比10％削減する",
    YEARLY: "例：リーダーとして、自施設が理想とするケアの形を確立する"
  }
}

// -------------------------------------------------------------
// Component: GoalCard (Memoized to prevent unnecessary re-renders)
// -------------------------------------------------------------
const GoalCard = React.memo(({ 
  goal, 
  bgClass, 
  iconClass, 
  labelClass,
  onEdit,
  onToggle
}: { 
  goal: Goal, 
  bgClass?: string, 
  iconClass?: string, 
  labelClass?: string,
  onEdit: (goal: Goal) => void,
  onToggle: (goal: Goal) => void
}) => {
  const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/40 shadow-xl backdrop-blur-md p-6 flex flex-col group transition-all duration-300",
        goal.isAchieved ? "bg-white/60 grayscale-[10%]" : bgClass || "bg-white/80"
      )}
    >
      {/* 背景の装飾 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl z-0 pointer-events-none"></div>

      {goal.isAchieved && (
          <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none z-10">
              <div className="absolute top-4 -right-8 w-40 bg-gradient-to-r from-amber-300 to-yellow-500 text-white shadow-lg text-[10px] font-black tracking-widest uppercase py-1 text-center rotate-45">
                  達成！
              </div>
          </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-2xl shadow-inner", iconClass || "bg-primary/10 text-primary")}>
                  {goal.type === 'DAILY' ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : 
                   goal.type === 'EVENT' ? <Flag className="w-5 h-5" /> :
                   <Target className="w-5 h-5" />}
                  </div>
                  <span className={cn("text-[10px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm border", labelClass || "bg-white text-gray-600 border-gray-100")}>
                  {goal.type === 'DAILY' ? '☀️ 日常' : 
                   goal.type === 'EVENT' ? '📅 期間' : '🏆 1年'}
                  </span>
              </div>

              <div className="flex items-center gap-1">
                  <button
                      onClick={() => onEdit(goal)}
                      className="text-gray-400 hover:text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                  >
                      <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                      onClick={() => onToggle(goal)}
                      className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-sm",
                          goal.isAchieved 
                              ? "bg-green-500 border-green-500 text-white" 
                              : "bg-white border-gray-200 text-gray-300 hover:border-green-400 hover:text-green-400"
                      )}
                  >
                      <CheckCircle2 className="w-4 h-4" />
                  </button>
              </div>
          </div>

          <h3 className={cn("text-lg font-extrabold leading-tight tracking-tight mb-3", goal.isAchieved ? "text-gray-600" : "text-gray-800")}>
              {goal.title}
          </h3>

          {goal.aiAlignmentNote && (
              <div className="bg-white/50 border border-white/60 rounded-xl p-3 mb-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-1 text-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">AI 理念診断</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {goal.aiAlignmentNote}
                  </p>
              </div>
          )}

          <div className="mt-auto pt-2">
              {goal.deadline && !goal.isAchieved && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold mb-3 bg-amber-50/50 inline-block px-2 py-1 rounded-md border border-amber-100/50">
                      <CalendarDays className="w-3 h-3 inline pb-0.5" />
                      期限: {new Date(goal.deadline).toLocaleDateString('ja-JP')}
                  </div>
              )}
              
              <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">進捗状況</span>
                  <span className={cn("text-base font-black", goal.isAchieved ? "text-green-600" : "text-primary")}>
                      {Math.round(progress)}%
                  </span>
              </div>
              <div className="w-full bg-gray-100/80 rounded-full h-3 overflow-hidden border border-gray-200/50 shadow-inner">
                  <div 
                      style={{ width: `${progress}%` }}
                      className={cn(
                          "h-full rounded-full shadow-sm transition-all duration-1000 ease-out",
                          goal.isAchieved ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-primary to-primary-foreground"
                      )}
                  />
              </div>
              <div className="flex justify-between mt-1 text-[10px] font-black text-gray-400">
                  <span>{goal.currentValue} {goal.unit}</span>
                  <span>{goal.targetValue} {goal.unit}</span>
              </div>
          </div>
      </div>
    </motion.div>
  )
})
GoalCard.displayName = 'GoalCard'


// -------------------------------------------------------------
// Component: GoalsPage
// -------------------------------------------------------------
export default function GoalsPage() {
  const { profile } = useProfile()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

  // 目標追加フォーム用ステート
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetValue: '',
    unit: '％',
    deadline: '',
    type: 'YEARLY' as Goal['type']
  })

  useEffect(() => {
    if (profile) {
      fetchGoals()
    }
  }, [profile])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
      }
    } catch (e) {
      console.error('Fetch goals error:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const openAddModal = useCallback(() => {
    setEditingGoalId(null)
    setNewGoal({ title: '', targetValue: '', unit: '％', deadline: '', type: 'EVENT' })
    setShowAddForm(true)
  }, [])

  const openEditModal = useCallback((goal: Goal) => {
    setEditingGoalId(goal.id)
    setNewGoal({
      title: goal.title,
      targetValue: goal.targetValue.toString(),
      unit: goal.unit,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      type: goal.type
    })
    setShowAddForm(true)
  }, [])

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setIsSubmitting(true)
    try {
      const url = '/api/goals'
      const method = editingGoalId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGoalId,
          title: newGoal.title,
          targetValue: parseFloat(newGoal.targetValue),
          unit: newGoal.unit,
          deadline: newGoal.deadline,
          type: newGoal.type,
          gradeLevel: profile.gradeLevel,
          experienceYears: profile.experienceYears,
          yearsOfService: profile.yearsOfService,
          welfarePoints: profile.welfarePoints,
          currentValue: editingGoalId ? undefined : 0, 
          periodKey: '2026-H1'
        })
      })

      if (res.ok) {
        setShowAddForm(false)
        setEditingGoalId(null)
        setNewGoal({ title: '', targetValue: '', unit: '％', deadline: '', type: 'EVENT' })
        fetchGoals()
      }
    } catch (e) {
      console.error('Save goal error:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleAchieve = useCallback(async (goal: Goal) => {
    const newStatus = !goal.isAchieved
    try {
        // Optimistic update
        setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, isAchieved: newStatus } : g))
        
        await fetch('/api/goals', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            id: goal.id,
            isAchieved: newStatus
            })
        })
        fetchGoals()
    } catch (e) {
        console.error('Update goal error:', e)
        fetchGoals() // revert on error
    }
  }, [])

  // カテゴリ分け
  const dailyGoals = goals.filter(g => g.type === 'DAILY')
  const yearlyGoals = goals.filter(g => g.type === 'YEARLY')
  const activeEventGoals = goals.filter(g => g.type === 'EVENT' && !g.isAchieved)
  const achievedGoals = goals.filter(g => g.type === 'EVENT' && g.isAchieved)

  // ユーザーの階層を判定
  const getCareerLevel = (): CareerLevel => {
    if (!profile) return 'NEWCOMER'
    
    // 等級5以上、または経験10年以上をエキスパート
    if ((profile?.gradeLevel || 0) >= 5 || (profile?.experienceYears || 0) >= 10) return 'EXPERT'
    // 等級3以上、または経験3年以上を中核
    if ((profile?.gradeLevel || 0) >= 3 || (profile?.experienceYears || 0) >= 3) return 'MID'
    
    return 'NEWCOMER'
  }

  const careerLevel = getCareerLevel()
  const dynamicPlaceholder = GOAL_SUGGESTIONS[careerLevel][newGoal.type] || "目標を入力してください"

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-gray-500 mt-4 font-bold">目標データを読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-8 pt-20 custom-scrollbar">
      {/* ヒーローヘッダー */}
      <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20 text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              目標・成長トラッカー
            </h1>
          </motion.div>
          <p className="text-sm text-gray-500 font-bold ml-14">
            {profile?.facilityName || '---'} / {profile?.unitName || '---'}
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button 
            onClick={openAddModal}
            className="rounded-full shadow-xl shadow-primary/20 h-12 px-6 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-sm font-black border border-white/20"
          >
            <Plus className="w-4 h-4 mr-1" /> 目標を新規作成
          </Button>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* レイヤー1：常に上にあるDailyとYearly */}
        <section>
          <div className="flex items-center gap-2 mb-4 pl-2">
            <Target className="w-5 h-5 text-gray-400" />
            <h2 className="text-sm font-black text-gray-500 tracking-wider uppercase">重点目標 (日常と1年)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily */}
            {dailyGoals.length > 0 ? (
                dailyGoals.map(goal => (
                    <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        bgClass="bg-gradient-to-br from-blue-50 to-indigo-50/30 border-blue-100/50" 
                        iconClass="bg-blue-500 text-white" 
                        labelClass="text-blue-600 bg-blue-100/50 border-blue-200/50"
                        onEdit={openEditModal}
                        onToggle={handleToggleAchieve}
                    />
                ))
            ) : (
                <div onClick={() => { setNewGoal(prev => ({...prev, type: 'DAILY'})); setShowAddForm(true); }} className="h-full min-h-[220px] rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center text-gray-400 cursor-pointer">
                    <Plus className="w-8 h-8 mb-2 text-gray-300" />
                    <span className="text-xs font-bold">毎日の目標を設定する</span>
                </div>
            )}
            
            {/* Yearly */}
            {yearlyGoals.length > 0 ? (
                yearlyGoals.map(goal => (
                    <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        bgClass="bg-gradient-to-br from-violet-50 to-fuchsia-50/30 border-violet-100/50" 
                        iconClass="bg-violet-500 text-white" 
                        labelClass="text-violet-600 bg-violet-100/50 border-violet-200/50"
                        onEdit={openEditModal}
                        onToggle={handleToggleAchieve}
                    />
                ))
            ) : (
                <div onClick={() => { setNewGoal(prev => ({...prev, type: 'YEARLY'})); setShowAddForm(true); }} className="h-full min-h-[220px] rounded-3xl border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/30 transition-colors flex flex-col items-center justify-center text-gray-400 cursor-pointer">
                    <Plus className="w-8 h-8 mb-2 text-gray-300" />
                    <span className="text-xs font-bold">1年の目標を設定する</span>
                </div>
            )}
          </div>
        </section>

        {/* レイヤー2：期間目標 */}
        <section>
          <div className="flex items-center gap-2 mb-4 pl-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h2 className="text-sm font-black text-gray-500 tracking-wider uppercase">現在の期間目標</h2>
          </div>
          
          {activeEventGoals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                {activeEventGoals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} onEdit={openEditModal} onToggle={handleToggleAchieve} />
                ))}
                </AnimatePresence>
            </div>
          ) : (
             <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm">
                <p className="text-sm font-bold text-gray-400">現在進行中の期間目標はありません。</p>
             </div>
          )}
        </section>

        {/* レイヤー3：達成実績 (増えていく場所) */}
        {achievedGoals.length > 0 && (
            <section className="pb-20">
                <div className="flex items-center gap-2 mb-6 pl-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-sm font-black text-gray-600 tracking-wider uppercase">栄誉の殿堂 (達成実績)</h2>
                    <span className="ml-2 bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-full">{achievedGoals.length} 個クリア</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                    {achievedGoals.map(goal => (
                        <motion.div 
                            key={goal.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -2 }}
                            className="bg-gradient-to-br from-[#FFFdf0] to-white border border-amber-200/40 rounded-2xl p-4 shadow-md relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <Award className="w-16 h-16 text-yellow-500" />
                            </div>
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <div className="bg-yellow-100 text-yellow-600 p-1.5 rounded-lg">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] font-black bg-white border border-gray-100 px-2 py-0.5 rounded-full text-gray-400">
                                    {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : '期限なし'}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-800 line-clamp-2 relative z-10">{goal.title}</h4>
                            <div className="mt-3 flex items-center justify-between z-10 relative">
                                <span className="text-[10px] font-bold text-gray-400">
                                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                                </span>
                                <button 
                                    onClick={() => handleToggleAchieve(goal)}
                                    className="text-[10px] font-bold text-gray-400 hover:text-gray-600 underline"
                                >
                                    戻す
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </section>
        )}
      </div>

      {/* モーダルフォーム */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm focus-within:outline-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {editingGoalId ? '目標を修正' : '個人目標を設定'}
                  </h2>
                </div>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">目標の種類</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'DAILY', label: '毎日', icon: '☀️' },
                      { id: 'EVENT', label: '期間', icon: '📅' },
                      { id: 'YEARLY', label: '1年', icon: '🏆' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewGoal({ ...newGoal, type: t.id as any })}
                        className={cn(
                          "py-2 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1",
                          newGoal.type === t.id 
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                            : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                        )}
                      >
                        <span className="text-sm">{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">何を達成しますか？</Label>
                  <Input 
                    placeholder={dynamicPlaceholder} 
                    className="rounded-2xl border-gray-200 h-10 text-sm font-bold placeholder:font-medium"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">目標値 (数値)</Label>
                    <Input 
                      type="number"
                      placeholder="100" 
                      className="rounded-2xl border-gray-200 h-10 text-sm font-bold"
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">単位</Label>
                    <Input 
                      placeholder="％" 
                      className="rounded-2xl border-gray-200 h-10 text-sm font-bold"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">達成期限（いつまでに？）</Label>
                  <Input 
                    type="date"
                    className="rounded-2xl border-gray-200 h-10 text-sm font-bold"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-2xl h-12 font-black text-sm shadow-lg shadow-primary/20 mt-2 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                   (editingGoalId ? '修正を保存する' : '目標を確定する')}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
