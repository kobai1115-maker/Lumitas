'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Shield, ShieldOff, ChevronDown, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

type Role = 'ADMIN' | 'MANAGER' | 'STAFF_CAREGIVER' | 'STAFF_NURSE' | 'STAFF_SOCIAL_WORKER' | 'STAFF_OFFICE' | 'STAFF_NUTRITIONIST'

type Staff = {
  id: string
  email: string
  fullName: string
  role: Role
  gradeLevel: number
  department: string
  welfarePoints: number
  isActive: boolean
  mustChangePassword: boolean
  createdAt: string
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: '管理者',
  MANAGER: 'マネージャー',
  STAFF_CAREGIVER: '介護職員',
  STAFF_NURSE: '看護職員',
  STAFF_SOCIAL_WORKER: '社会福祉士',
  STAFF_OFFICE: '事務職員',
  STAFF_NUTRITIONIST: '栄養士',
}

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-purple-100 text-purple-700',
  STAFF_CAREGIVER: 'bg-teal-100 text-teal-700',
  STAFF_NURSE: 'bg-blue-100 text-blue-700',
  STAFF_SOCIAL_WORKER: 'bg-orange-100 text-orange-700',
  STAFF_OFFICE: 'bg-gray-100 text-gray-700',
  STAFF_NUTRITIONIST: 'bg-green-100 text-green-700',
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // 新規スタッフフォーム
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', role: 'STAFF_CAREGIVER' as Role,
    gradeLevel: 1, department: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff')
      if (res.ok) {
        const data = await res.json()
        setStaff(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setMessage('✅ スタッフを追加しました')
        setShowAddForm(false)
        setForm({ email: '', password: '', fullName: '', role: 'STAFF_CAREGIVER', gradeLevel: 1, department: '' })
        fetchStaff()
      } else {
        const data = await res.json()
        setMessage(`❌ ${data.error}`)
      }
    } catch {
      setMessage('❌ エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (s: Staff) => {
    await fetch('/api/admin/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, isActive: !s.isActive })
    })
    fetchStaff()
  }

  const handleRoleChange = async (id: string, role: Role) => {
    await fetch('/api/admin/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role })
    })
    setEditingId(null)
    fetchStaff()
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* ヘッダー */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">スタッフ管理</h1>
              <p className="text-xs text-gray-500">アカウント追加・権限設定</p>
            </div>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4" />
            スタッフ追加
          </Button>
        </motion.div>

        {/* メッセージ */}
        {message && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`text-sm p-3 rounded-lg ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </motion.div>
        )}

        {/* 新規追加フォーム */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card className="border-primary/30 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">新規スタッフ追加</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddStaff} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">氏名 *</Label>
                        <Input placeholder="山田 太郎" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">部署 *</Label>
                        <Input placeholder="介護部門" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">メールアドレス（ログインID） *</Label>
                      <Input type="email" placeholder="yamada@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">初期パスワード *</Label>
                      <Input type="password" placeholder="初回ログイン後に変更されます" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">権限（ロール）</Label>
                        <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                          value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}>
                          {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">等級（1〜7）</Label>
                        <Input type="number" min={1} max={7} value={form.gradeLevel} onChange={e => setForm({ ...form, gradeLevel: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? '追加中...' : 'アカウントを作成'}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* スタッフ一覧 */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : staff.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">スタッフが登録されていません</div>
        ) : (
          <div className="space-y-3">
            {staff.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`shadow-sm ${!s.isActive ? 'opacity-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-gray-900 text-sm">{s.fullName}</span>
                          {s.mustChangePassword && (
                            <Badge className="text-[10px] bg-yellow-100 text-yellow-700 border-yellow-200">パスワード変更必要</Badge>
                          )}
                          {!s.isActive && <Badge className="text-[10px] bg-gray-200 text-gray-500">無効</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{s.email} · {s.department} · 等級{s.gradeLevel}</p>

                        {/* ロール変更 */}
                        {editingId === s.id ? (
                          <div className="flex items-center gap-2">
                            <select className="border rounded-md px-2 py-1 text-xs bg-background flex-1"
                              defaultValue={s.role}
                              onChange={e => handleRoleChange(s.id, e.target.value as Role)}>
                              {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingId(s.id)}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[s.role]} hover:opacity-80 transition-opacity`}>
                            {ROLE_LABELS[s.role]}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* アクションボタン */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleToggleActive(s)}
                          className={`p-1.5 rounded-lg transition-colors ${s.isActive ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                          title={s.isActive ? 'アカウントを無効化' : 'アカウントを有効化'}>
                          {s.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                      </div>
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
