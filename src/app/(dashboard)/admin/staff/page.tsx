'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Shield, ShieldOff, ChevronDown, ChevronRight, X, Building2, UserCircle, Search, Filter, LayoutGrid, CheckCircle2, MessageSquare, FileText, Loader2, MoreHorizontal, Sparkles, Heart, Stethoscope, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { clsx } from 'clsx'

type Staff = {
  id: string
  staffId: string
  fullName: string
  email: string
  role: string
  department: string
  gradeLevel: number
  welfarePoints: number
  isActive: boolean
}

const ROLE_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  'ADMIN': { label: '法人管理者', color: 'rose', icon: Shield },
  'MANAGER': { label: '施設長', color: 'indigo', icon: Sparkles },
  'STAFF_CAREGIVER': { label: '介護職', color: 'teal', icon: Heart },
  'STAFF_NURSE': { label: '看護職', color: 'blue', icon: Stethoscope },
  'STAFF_OFFICE': { label: '事務職', color: 'slate', icon: Briefcase },
  'STAFF_SOCIAL_WORKER': { label: '生活相談員', color: 'orange', icon: Users },
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab ] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 新規登録フォーム用
  const [formData, setFormData] = useState({
    staffId: '',
    fullName: '',
    department: '介護課',
    role: 'STAFF_CAREGIVER',
    gradeLevel: 1,
    birthday: '',
    yearsOfService: 0,
    experienceYears: 0
  })

  // データ取得関数
  async function fetchStaff() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/staff')
      if (res.ok) {
        const data = await res.json()
        setStaffList(data)
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success('スタッフを正常に登録しました')
        setIsAddDialogOpen(false)
        setFormData({
          staffId: '',
          fullName: '',
          department: '介護課',
          role: 'STAFF_CAREGIVER',
          gradeLevel: 1,
          birthday: '',
          yearsOfService: 0,
          experienceYears: 0
        })
        fetchStaff() // リスト更新
      } else {
        const err = await res.json()
        toast.error(err.error || '登録に失敗しました')
      }
    } catch (err) {
      toast.error('サーバー接続エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = !searchTerm || s.fullName.includes(searchTerm) || s.department.includes(searchTerm) || s.staffId.includes(searchTerm)
    const matchesTab = activeTab === 'all' || s.role === activeTab
    return matchesSearch && matchesTab
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black text-gray-400 tracking-widest">スタッフデータを読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 md:px-0 pb-32">
      {/* プレミアム・ヘッダー: シャープで洗練された印象に */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-3 bg-gray-900 rounded-[1.25rem] text-white shadow-2xl shadow-gray-200">
               <Users className="w-7 h-7" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-none mb-2">スタッフ管理</h1>
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">社会福祉法人 萌佑会 | 統合管理システム</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="名前・ID・部署で検索..." 
              className="pl-12 rounded-2xl border-none bg-white shadow-xl shadow-gray-100/50 h-14 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger 
              render={
                <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
                  <Plus className="w-5 h-5 mr-2" />
                  新規スタッフ登録
                </Button>
              }
            />
            <DialogContent className="max-w-2xl bg-white rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
              <form onSubmit={handleAddStaff}>
                <div className="bg-gray-900 p-8 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                   <div className="relative z-10 flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-black tracking-tight">新規スタッフ登録</DialogTitle>
                        <DialogDescription className="text-white/50 font-bold text-xs">
                          新しく配属された職員の基本情報をシステムに登録します。
                        </DialogDescription>
                      </div>
                   </div>
                </div>

                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="staffId" className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">職員ID</Label>
                        <Input 
                          id="staffId" 
                          placeholder="例: S005" 
                          required
                          className="rounded-xl border-gray-100 h-12 font-bold focus:ring-primary/10"
                          value={formData.staffId}
                          onChange={e => setFormData({...formData, staffId: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">氏名</Label>
                        <Input 
                          id="fullName" 
                          placeholder="例: 鈴木 太郎" 
                          required
                          className="rounded-xl border-gray-100 h-12 font-bold focus:ring-primary/10"
                          value={formData.fullName}
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">部署名</Label>
                        <Input 
                          id="department" 
                          placeholder="例: 介護課 第一係" 
                          required
                          className="rounded-xl border-gray-100 h-12 font-bold focus:ring-primary/10"
                          value={formData.department}
                          onChange={e => setFormData({...formData, department: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthday" className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">生年月日</Label>
                        <Input 
                          id="birthday" 
                          type="date"
                          className="rounded-xl border-gray-100 h-12 font-bold focus:ring-primary/10"
                          value={formData.birthday}
                          onChange={e => setFormData({...formData, birthday: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="gradeLevel" className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">現在の等級 (1-7)</Label>
                        <Input 
                          id="gradeLevel" 
                          type="number" 
                          min="1" 
                          max="7"
                          className="rounded-xl border-gray-100 h-12 font-bold focus:ring-primary/10"
                          value={formData.gradeLevel}
                          onChange={e => setFormData({...formData, gradeLevel: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearsOfService" className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">萌佑会での勤続年数</Label>
                        <div className="relative">
                          <Input 
                            id="yearsOfService" 
                            type="number" 
                            min="0"
                            className="rounded-xl border-gray-100 h-12 font-bold pr-12"
                            value={formData.yearsOfService}
                            onChange={e => setFormData({...formData, yearsOfService: parseInt(e.target.value)})}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">年</span>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="experienceYears" className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">福祉業界の通算経験年数</Label>
                        <div className="relative">
                          <Input 
                            id="experienceYears" 
                            type="number" 
                            min="0"
                            className="rounded-xl border-gray-100 h-12 font-bold pr-12"
                            value={formData.experienceYears}
                            onChange={e => setFormData({...formData, experienceYears: parseInt(e.target.value)})}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">年</span>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">権限・役割の選択</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {Object.entries(ROLE_CONFIG).map(([key, config]) => {
                           const Icon = config.icon
                           const isSelected = formData.role === key
                           return (
                             <button
                               type="button"
                               key={key}
                               onClick={() => setFormData({...formData, role: key})}
                               className={clsx(
                                 "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 text-left",
                                 isSelected 
                                   ? "bg-primary/5 border-primary shadow-sm" 
                                   : "bg-white border-gray-100 hover:border-gray-200"
                               )}
                             >
                               <div className={clsx(
                                 "p-2 rounded-xl transition-colors",
                                 isSelected ? "bg-primary text-white" : "bg-gray-50 text-gray-400"
                               )}>
                                 <Icon className="w-4 h-4" />
                               </div>
                               <span className={clsx(
                                 "text-[10px] font-black tracking-tight",
                                 isSelected ? "text-primary" : "text-gray-500"
                               )}>{config.label}</span>
                             </button>
                           )
                         })}
                      </div>
                   </div>
                </div>

                <DialogFooter className="bg-gray-50 p-6 flex items-center justify-between">
                   <Button 
                     type="button" 
                     variant="ghost" 
                     className="rounded-xl font-bold" 
                     onClick={() => setIsAddDialogOpen(false)}
                   >
                     キャンセル
                   </Button>
                   <Button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="rounded-xl px-8 font-black bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-200"
                   >
                     {isSubmitting ? (
                        <div className="flex items-center gap-2">
                           <Loader2 className="w-4 h-4 animate-spin" /> 登録中...
                        </div>
                     ) : "スタッフを登録する"}
                   </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 絞り込みタブ: スタイリッシュなピル形式 */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent p-0 h-auto flex flex-wrap items-center gap-3 mb-10 overflow-x-auto no-scrollbar pb-2">
           <FilterPill value="all" label="すべてを表示" count={staffList.length} isActive={activeTab === 'all'} />
           <FilterPill value="ADMIN" label="管理者" count={staffList.filter(s => s.role === 'ADMIN').length} isActive={activeTab === 'ADMIN'} icon={Shield} />
           <FilterPill value="MANAGER" label="施設長" count={staffList.filter(s => s.role === 'MANAGER').length} isActive={activeTab === 'MANAGER'} icon={Sparkles} />
           <FilterPill value="STAFF_CAREGIVER" label="介護職" count={staffList.filter(s => s.role === 'STAFF_CAREGIVER').length} isActive={activeTab === 'STAFF_CAREGIVER'} icon={Heart} />
           <FilterPill value="STAFF_NURSE" label="看護職" count={staffList.filter(s => s.role === 'STAFF_NURSE').length} isActive={activeTab === 'STAFF_NURSE'} icon={Stethoscope} />
        </TabsList>

        {/* スタッフリスト: 高密度で横長のプレミアム・リストカード */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredStaff.map((s, i) => {
              const roleKey = (s.role || '').toUpperCase()
              const config = ROLE_CONFIG[roleKey] || { label: s.role, color: 'gray', icon: UserCircle }
              const Icon = config.icon
              
              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link href={`/evaluation/report?userId=${s.id}`} className="block relative bg-white border border-transparent hover:border-primary/20 rounded-3xl p-2 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group overflow-hidden">
                     <div className="flex flex-col lg:flex-row lg:items-center">
                        {/* 左：プロフィール基本情報 */}
                        <div className="flex items-center gap-5 p-4 flex-1 min-w-[320px]">
                           <div className="relative">
                              <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center font-black text-2xl text-gray-200 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                                {s.fullName.charAt(0)}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-50">
                                <RoleBadgeIcon role={s.role} />
                              </div>
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                 <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{s.fullName}</h3>
                                 <span className="text-[10px] font-black text-gray-300 border border-gray-100 rounded px-1.5 py-0.5 tracking-widest uppercase">{s.staffId}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                 <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 opacity-50" />{s.department}</span>
                                 <span className="bg-gray-100 text-gray-500 rounded px-2 py-0.5">等級: {s.gradeLevel}</span>
                              </div>
                           </div>
                        </div>

                        {/* 中央：ステータス情報 (PC版のみ境界線) */}
                        <div className="flex items-center px-8 lg:border-l lg:border-r border-gray-50 min-w-[200px] h-20">
                           <div className={clsx(
                             "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[11px] tracking-tighter transition-all",
                             config.color === 'rose' && "bg-rose-50 text-rose-600 shadow-sm shadow-rose-100/20",
                             config.color === 'indigo' && "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/20",
                             config.color === 'teal' && "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/20",
                             config.color === 'blue' && "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/20",
                             config.color === 'slate' && "bg-slate-50 text-slate-600 shadow-sm shadow-slate-100/20",
                             config.color === 'gray' && "bg-gray-50 text-gray-400 shadow-sm shadow-gray-100/20",
                           )}>
                              <Icon className="w-4 h-4" />
                              {config.label}
                           </div>
                        </div>

                        {/* 右：数値データ & アクション */}
                        <div className="p-4 lg:p-6 flex items-center justify-between lg:justify-end gap-10 lg:min-w-[320px]">
                           <div className="flex flex-col items-end">
                               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">累計獲得ポイント</p>
                              <p className="text-2xl font-black text-primary leading-none counter tracking-tight">{s.welfarePoints.toLocaleString()}<span className="text-xs ml-1 font-bold">ポイント</span></p>
                           </div>
                           
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-primary font-black text-[11px] opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 hidden md:flex">
                                 詳細レポートを表示
                                 <div className="p-2 bg-primary/10 rounded-xl">
                                    <FileText className="w-4 h-4" />
                                 </div>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-primary transition-colors group-hover:translate-x-1 duration-300">
                                 <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-white" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredStaff.length === 0 && (
            <div className="py-40 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-lg font-black text-gray-300">該当する職員が見つかりません</h3>
              <p className="text-sm text-gray-300">検索条件を変更して再度お試しください</p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}

function FilterPill({ value, label, count, isActive, icon: Icon }: { value: string, label: string, count: number, isActive: boolean, icon?: any }) {
  return (
    <TabsTrigger 
      value={value}
      className={clsx(
        "rounded-[1.25rem] px-6 py-3 font-black text-xs transition-all flex items-center gap-2.5",
        isActive 
          ? "bg-gray-900 text-white shadow-2xl shadow-gray-300 scale-[1.05]" 
          : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm"
      )}
    >
      {Icon && <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-primary" : "text-gray-300")} />}
      {label}
      <span className={clsx(
        "px-2 py-0.5 rounded-lg text-[10px] leading-none",
        isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
      )}>
        {count}
      </span>
    </TabsTrigger>
  )
}

function RoleBadgeIcon({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] || { icon: UserCircle, color: 'gray' }
  const Icon = config.icon
  return (
    <div className={clsx(
      "w-full h-full rounded-full flex items-center justify-center",
      config.color === 'rose' && "text-rose-500",
      config.color === 'indigo' && "text-indigo-500",
      config.color === 'teal' && "text-emerald-500",
      config.color === 'blue' && "text-blue-500",
      config.color === 'slate' && "text-slate-500",
      config.color === 'gray' && "text-gray-400",
    )}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  )
}



