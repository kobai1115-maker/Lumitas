'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Calendar, Award, Plus, X, Users, User } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useProfile } from '@/hooks/use-profile'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

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

type StaffMember = {
  id: string
  fullName: string
  department: string
}

export default function OneOnOnePage() {
  const { profile } = useProfile()
  const [notes, setNotes] = useState<OneOnOneNote[]>([])
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [form, setForm] = useState({
    employeeId: '',
    content: '',
    meetingDate: format(new Date(), 'yyyy-MM-dd'),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { 
    if (profile) {
      fetchNotes()
      fetchStaff()
    }
  }, [profile])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff?isActive=true')
      if (res.ok) {
        const data = await res.json()
        setStaffList(data)
      }
    } catch (e) {
      console.error('Fetch staff error:', e)
    }
  }

  const fetchNotes = async () => {
    try {
      // ログインユーザーに関わる面談のみ取得 (API側でフィルタ済み)
      const res = await fetch('/api/one-on-one')
      if (res.ok) setNotes(await res.json())
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.employeeId || !profile) return
    
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/one-on-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          managerId: profile.id, // 自分が実施者
          meetingDate: new Date(form.meetingDate).toISOString() 
        })
      })
      if (res.ok) {
        const data = await res.json()
        setSuccessMsg(`✅ 面談記録を保存しました！\n受講者: +${data.pointsGranted.employee}pt／実施者: +${data.pointsGranted.manager}pt 付与`)
        setShowForm(false)
        setForm({ ...form, content: '', employeeId: '' })
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
              <p className="text-xs text-gray-500">
                {profile?.facilityName || '---'} / {profile?.unitName || '---'}
              </p>
            </div>
          </div>
          {(profile?.role === 'MAIN_ADMIN' || profile?.role === 'SUB_ADMIN') && (
            <Button size="sm" className="gap-1 rounded-xl font-black shadow-lg shadow-primary/20" onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4" />記録を追加
            </Button>
          )}
        </motion.div>

        {/* ポイント付与の説明バナー */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 border border-gray-700 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-primary/20 rounded-2xl rotate-3">
              <Award className="w-8 h-8 text-primary shadow-lg" />
            </div>
            <div>
              <p className="text-lg font-black text-white tracking-tight">面談でポイントが付与されます</p>
              <div className="flex items-center gap-4 mt-1 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" />受講者: <span className="text-white">+5pt</span></span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary/60" />実施者: <span className="text-white">+3pt</span></span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 成功メッセージ */}
        {successMsg && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-xl whitespace-pre-line font-bold">
            {successMsg}
          </motion.div>
        )}

        {/* 記録フォーム */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Card className="border-gray-100 shadow-2xl rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> 面談記録の作成
                </CardTitle>
                <CardDescription className="text-[10px] font-bold">
                  自施設の職員から受講者を選択してください。
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">面談日</Label>
                      <Input type="date" value={form.meetingDate} className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                        onChange={e => setForm({ ...form, meetingDate: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">面談受講者</Label>
                      {/* @ts-ignore */}
                      <Select value={form.employeeId} onValueChange={(val: string) => setForm({ ...form, employeeId: val })}>
                        <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 font-bold h-10">
                          <SelectValue placeholder="受講者を選択" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                          {staffList.filter(s => s.id !== profile?.id).map((staff) => (
                            <SelectItem key={staff.id} value={staff.id} className="font-bold text-sm">
                              {staff.fullName} <span className="text-[10px] text-gray-400 ml-1">({staff.department})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">面談内容・フィードバック *</Label>
                    <Textarea 
                      placeholder="目標の進捗、現在の課題、本人への称賛などを具体的に記入してください。"
                      value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                      className="min-h-[120px] rounded-2xl border-gray-100 bg-gray-50/50 resize-none p-4 text-sm font-bold leading-relaxed focus:bg-white transition-colors"
                      required 
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1 rounded-xl font-black py-6 shadow-xl shadow-primary/10" disabled={isSubmitting || !form.employeeId}>
                      {isSubmitting ? '保存中...' : '記録してポイント付与'}
                    </Button>
                    <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
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
