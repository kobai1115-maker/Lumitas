'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Calendar, Award, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type OneOnOneNote = {
  id: string
  employeeId: string
  managerId: string
  content: string
  aiActionItems?: string
  meetingDate: string
  employeePoints: number
  managerPoints: number
  pointsGranted: boolean
  employee: { fullName: string; department: string }
  manager: { fullName: string }
}

export default function OneOnOnePage() {
  const [notes, setNotes] = useState<OneOnOneNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [form, setForm] = useState({
    employeeId: 'demo-user-id',
    managerId: 'demo-manager-id',
    content: '',
    meetingDate: format(new Date(), 'yyyy-MM-dd'),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/one-on-one?userId=demo-user-id')
      if (res.ok) setNotes(await res.json())
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/one-on-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, meetingDate: new Date(form.meetingDate).toISOString() })
      })
      if (res.ok) {
        const data = await res.json()
        setSuccessMsg(`✅ 面談記録を保存しました！\n受講者: +${data.pointsGranted.employee}pt／実施者: +${data.pointsGranted.manager}pt 付与`)
        setShowForm(false)
        setForm({ ...form, content: '' })
        fetchNotes()
        setTimeout(() => setSuccessMsg(''), 5000)
      }
    } catch (e) { console.error(e) }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ヘッダー */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">1on1面談</h1>
              <p className="text-xs text-gray-500">記録と両者へのポイント付与</p>
            </div>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" />記録
          </Button>
        </motion.div>

        {/* ポイント付与の説明バナー */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary/10 to-secondary/20 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">面談でポイントがもらえます！</p>
              <p className="text-xs text-gray-600 mt-0.5">
                面談受講者: <span className="font-bold text-primary">+5pt</span>　面談実施者: <span className="font-bold text-primary">+3pt</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* 成功メッセージ */}
        {successMsg && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-xl whitespace-pre-line">
            {successMsg}
          </motion.div>
        )}

        {/* 記録フォーム */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Card className="border-primary/30 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">面談記録を追加</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">面談日</Label>
                    <Input type="date" value={form.meetingDate}
                      onChange={e => setForm({ ...form, meetingDate: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">面談内容・話したこと *</Label>
                    <Textarea placeholder="目標の進捗確認、困っていること、次回に向けた課題など..."
                      value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                      rows={4} required />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? '保存中...' : '記録してポイント付与'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 面談履歴 */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : notes.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>面談記録がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note, i) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(note.meetingDate), 'yyyy年M月d日（EEE）', { locale: ja })}
                      </div>
                      {note.pointsGranted && (
                        <div className="flex items-center gap-1 text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                          <Award className="w-3 h-3" />
                          ポイント付与済み
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    {note.aiActionItems && (
                      <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-primary mb-1">✨ AI 次回アクション提案</p>
                        <p className="text-xs text-gray-700">{note.aiActionItems}</p>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400">
                      <span>受講: {note.employee?.fullName ?? '-'}</span>
                      <span>実施: {note.manager?.fullName ?? '-'}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
