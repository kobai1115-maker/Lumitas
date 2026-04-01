'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Target, Users, Plus, ChevronRight, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

type OrgGoalLevel = 'MISSION' | 'CORPORATE' | 'DEPARTMENT'

type OrgGoal = {
  id: string
  level: OrgGoalLevel
  title: string
  description: string
  department?: string
  periodKey?: string
  children: OrgGoal[]
  createdBy: { fullName: string }
  createdAt: string
}

const LEVEL_CONFIG: Record<OrgGoalLevel, { label: string; color: string; icon: React.ElementType }> = {
  MISSION:    { label: '法人理念',   color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Building2 },
  CORPORATE:  { label: '法人目標',   color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: Target },
  DEPARTMENT: { label: '部署目標',   color: 'bg-teal-100 text-teal-700 border-teal-200',       icon: Users },
}

export default function OrgGoalsPage() {
  const [goals, setGoals] = useState<OrgGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    level: 'CORPORATE' as OrgGoalLevel,
    title: '', description: '', department: '', periodKey: '2026-H1', parentId: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchGoals() }, [])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/org-goals')
      if (res.ok) setGoals(await res.json())
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/org-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          department: form.level === 'DEPARTMENT' ? form.department : null,
          periodKey: form.level !== 'MISSION' ? form.periodKey : null,
          parentId: form.parentId || null,
        })
      })
      if (res.ok) {
        setMessage('✅ 目標を追加しました')
        setShowForm(false)
        setForm({ level: 'CORPORATE', title: '', description: '', department: '', periodKey: '2026-H1', parentId: '' })
        fetchGoals()
      } else { setMessage('❌ 追加に失敗しました') }
    } catch { setMessage('❌ エラーが発生しました') }
    finally { setIsSubmitting(false) }
  }

  // ツリー表示（MISSION > CORPORATE > DEPARTMENT順）
  const missions = goals.filter(g => g.level === 'MISSION')
  const corporates = goals.filter(g => g.level === 'CORPORATE')
  const departments = goals.filter(g => g.level === 'DEPARTMENT')

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ヘッダー */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">組織目標管理</h1>
              <p className="text-xs text-gray-500">法人理念 → 法人目標 → 部署目標の階層設定</p>
            </div>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" />追加
          </Button>
        </motion.div>

        {message && (
          <div className={`text-sm p-3 rounded-lg ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>
        )}

        {/* 追加フォーム */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card className="border-primary/30 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">目標を追加</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">目標レベル</Label>
                      <div className="flex gap-2">
                        {(Object.entries(LEVEL_CONFIG) as [OrgGoalLevel, typeof LEVEL_CONFIG[OrgGoalLevel]][]).map(([value, cfg]) => (
                          <button key={value} type="button"
                            onClick={() => setForm({ ...form, level: value })}
                            className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-all ${form.level === value ? cfg.color : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">タイトル *</Label>
                      <Input placeholder="例：地域に根ざした福祉サービスの実現" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">詳細・内容 *</Label>
                      <Textarea placeholder="目標の詳細や目指す姿を記入してください" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
                    </div>
                    {form.level === 'DEPARTMENT' && (
                      <div className="space-y-1">
                        <Label className="text-xs">対象部署</Label>
                        <Input placeholder="例：介護部門" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                      </div>
                    )}
                    {form.level !== 'MISSION' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">期間</Label>
                          <Input placeholder="2026-H1" value={form.periodKey} onChange={e => setForm({ ...form, periodKey: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">上位目標ID（任意）</Label>
                          <Input placeholder="紐づける目標ID" value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? '追加中...' : '目標を追加'}</Button>
                      <Button type="button" variant="ghost" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 目標一覧 */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : goals.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>組織目標がまだ設定されていません</p>
            <p className="text-xs mt-1">まず「法人理念」から追加しましょう</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...missions, ...corporates, ...departments].map((goal, i) => {
              const cfg = LEVEL_CONFIG[goal.level]
              const Icon = cfg.icon
              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border flex-shrink-0 ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-[10px] border ${cfg.color}`}>{cfg.label}</Badge>
                            {goal.department && <span className="text-[10px] text-gray-500">{goal.department}</span>}
                            {goal.periodKey && <span className="text-[10px] text-gray-400">{goal.periodKey}</span>}
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 mb-1">{goal.title}</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">{goal.description}</p>
                          {goal.children && goal.children.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
                              <ChevronRight className="w-3 h-3" />
                              {goal.children.length}件の下位目標と連携中
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
