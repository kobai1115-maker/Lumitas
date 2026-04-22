'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Shield, Search, Filter, Loader2, 
  ChevronRight, Heart, Stethoscope, Briefcase, 
  FileSpreadsheet, LayoutGrid, Building2, GraduationCap,
  ChevronDown, FileText, UserCircle
} from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { clsx } from 'clsx'
import { useProfile } from '@/hooks/use-profile'
import { StaffImportModal } from '@/components/features/admin/StaffImportModal'
import { FiscalTransitionAlert } from '@/components/features/dashboard/FiscalTransitionAlert'
import { calculateTenure } from '@/lib/utils/date'
import { getFiscalYear } from '@/lib/utils/fiscal-year'

type Staff = {
  id: string
  staffId: string
  fullName: string
  fullNameKana?: string
  email: string
  role: string
  department: string
  gradeLevel: number
  yearsOfService: number
  hireDate?: string
  welfarePoints: number
  isActive: boolean
}

const ROLE_CONFIG: Record<string, { label: string, color: string, icon: any, bg: string, text: string }> = {
  'DEVELOPER': { label: '開発者', color: 'violet', icon: Shield, bg: 'bg-violet-50', text: 'text-violet-600' },
  'MAIN_ADMIN': { label: '法人管理者', color: 'rose', icon: Shield, bg: 'bg-rose-50', text: 'text-rose-600' },
  'SUB_ADMIN': { label: '施設長', color: 'indigo', icon: LayoutGrid, bg: 'bg-indigo-50', text: 'text-indigo-600' },
  'GENERAL': { label: '一般職員', color: 'teal', icon: Heart, bg: 'bg-teal-50', text: 'text-teal-600' },
}

export default function AdminStaffPage() {
  const { profile, loading: authLoading, isCorpAdmin, isSystemAdmin, isFacilityManager } = useProfile()
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [facilities, setFacilities] = useState<any[]>([])
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // 拡張フィルター
  const [filters, setFilters] = useState({
    role: 'all',
    department: 'all',
    gradeLevel: 'all'
  })

  // 新規登録フォーム用
  const [formData, setFormData] = useState({
    staffId: '',
    fullName: '',
    fullNameKana: '',
    email: '',
    department: '介護課',
    role: 'GENERAL',
    gradeLevel: 1,
    birthday: '',
    hireDate: '',
    yearsOfService: 0,
    experienceYears: 0,
    facilityId: ''
  })

  // 施設一覧取得
  useEffect(() => {
    if (!authLoading && (isCorpAdmin || isSystemAdmin)) {
      fetch('/api/admin/facilities')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFacilities(data)
            if (data.length > 0 && !selectedFacilityId) {
              setSelectedFacilityId(data[0].id)
            }
          }
        })
        .catch(() => {})
    }
  }, [authLoading, isCorpAdmin, isSystemAdmin])

  useEffect(() => {
    if (!authLoading && isFacilityManager && profile?.facilityId) {
      setSelectedFacilityId(profile.facilityId)
    }
  }, [authLoading, isFacilityManager, profile])

  async function fetchStaff() {
    if (!selectedFacilityId && !isSystemAdmin) {
       setLoading(false)
       return
    }
    setLoading(true)
    try {
      const url = selectedFacilityId 
        ? `/api/admin/staff?facilityId=${selectedFacilityId}`
        : '/api/admin/staff'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setStaffList(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [selectedFacilityId])

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, facilityId: selectedFacilityId })
      })

      if (res.ok) {
        toast.success('スタッフを正常に登録しました')
        setIsAddDialogOpen(false)
        setFormData({
          staffId: '', fullName: '', fullNameKana: '', email: '', department: '介護課',
          role: 'GENERAL', gradeLevel: 1, birthday: '',
          hireDate: '', yearsOfService: 0, experienceYears: 0,
          facilityId: selectedFacilityId
        })
        fetchStaff()
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

  const filteredStaff = useMemo(() => {
    if (!Array.isArray(staffList)) return []
    return staffList.filter(s => {
      const matchesSearch = !searchTerm || 
        (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.fullNameKana || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.staffId || '').includes(searchTerm) || 
        (s.department || '').includes(searchTerm)
      
      const matchesRole = filters.role === 'all' || s.role === filters.role
      const matchesDept = filters.department === 'all' || s.department === filters.department
      const matchesGrade = filters.gradeLevel === 'all' || String(s.gradeLevel || '') === filters.gradeLevel
      
      return matchesSearch && matchesRole && matchesDept && matchesGrade
    })
  }, [staffList, searchTerm, filters])

  const departments = useMemo(() => {
     if (!Array.isArray(staffList)) return []
     return Array.from(new Set(staffList.map(s => s.department || '未設定')))
  }, [staffList])

  if (authLoading) return null

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-gray-400 rotate-3 transform group hover:rotate-0 transition-all duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 whitespace-nowrap">
                スタッフ管理
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                {isSystemAdmin ? 'System Admin Console' : (profile?.corporationName || 'Corporation Admin')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="h-12 px-6 rounded-xl border-gray-100 bg-white/50 backdrop-blur-md shadow-sm font-bold hover:bg-white transition-all text-gray-600"
              onClick={() => setIsImportModalOpen(true)}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              一括登録
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger render={
                <Button className="h-12 px-8 rounded-xl bg-primary text-white font-black hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all">
                  <Plus className="w-5 h-5 mr-2" />
                  新規登録
                </Button>
              } />
              <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <form onSubmit={handleAddStaff}>
                  <div className="bg-gray-900 p-8 text-white">
                    <DialogTitle className="text-2xl font-black">スタッフ登録</DialogTitle>
                    <DialogDescription className="text-white/60">
                      必要な情報を入力して職員をシステムに登録します。
                    </DialogDescription>
                  </div>
                  <div className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-gray-400 uppercase">氏名</Label>
                        <Input 
                          placeholder="例: 山田 太郎" required 
                          value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-gray-400 uppercase">フリガナ (カタカナ)</Label>
                        <Input 
                          placeholder="例: ヤマダ タロウ" 
                          value={formData.fullNameKana} onChange={e => setFormData({...formData, fullNameKana: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-gray-400 uppercase">職員ID (7桁)</Label>
                      <Input 
                        placeholder="例: 1000001" maxLength={7} required 
                        value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-gray-400 uppercase">メールアドレス (ログイン用)</Label>
                      <Input 
                        type="email" placeholder="staff@example.com" 
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-gray-400 uppercase">部署</Label>
                        <Input 
                          value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-gray-400 uppercase">役割</Label>
                        <select 
                          className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm font-medium"
                          value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                          {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="p-6 bg-gray-50">
                    <Button type="submit" disabled={isSubmitting} className="w-full font-black">
                      {isSubmitting ? '登録中...' : '登録を完了する'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <FiscalTransitionAlert />

        <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-3 shadow-xl shadow-gray-200/50 mb-12">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="名前、ID、部署名で検索..." 
                className="h-14 pl-14 pr-6 rounded-2xl border-none bg-transparent font-bold text-gray-700 placeholder:text-gray-300 focus:ring-0"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 p-1">
              <Button 
                variant={showFilters ? "default" : "ghost"}
                className={clsx(
                  "h-12 px-6 rounded-xl font-bold transition-all",
                  showFilters ? "shadow-lg bg-gray-900" : "hover:bg-gray-100/50"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                絞り込み
                {Object.values(filters).filter(v => v !== 'all').length > 0 && (
                  <Badge className="ml-2 bg-primary/20 text-primary border-none text-[10px]">
                    {Object.values(filters).filter(v => v !== 'all').length}
                  </Badge>
                )}
              </Button>
              
              <div className="h-8 w-px bg-gray-100 mx-2 hidden lg:block" />

              {(isCorpAdmin || isSystemAdmin) && Array.isArray(facilities) && facilities.length > 0 && (
                <div className="flex items-center px-4 h-12 bg-gray-50/50 rounded-xl border border-gray-100">
                  <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                  <select 
                    className="bg-transparent text-xs font-black text-gray-600 appearance-none border-none focus:ring-0 cursor-pointer min-w-[120px]"
                    value={selectedFacilityId}
                    onChange={e => setSelectedFacilityId(e.target.value)}
                  >
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-2 border-t border-gray-50 flex flex-wrap gap-8">
                  <FilterGroup 
                    label="役職・役割" 
                    value={filters.role} 
                    onChange={v => setFilters({...filters, role: v})}
                    options={[{ label: 'すべて', value: 'all' }, ...Object.entries(ROLE_CONFIG).map(([k, v]) => ({ label: v.label, value: k }))]}
                  />
                  <FilterGroup 
                    label="部署" 
                    value={filters.department} 
                    onChange={v => setFilters({...filters, department: v})}
                    options={[{ label: 'すべて', value: 'all' }, ...departments.map(d => ({ label: d, value: d }))]}
                  />
                  <FilterGroup 
                    label="等級" 
                    value={filters.gradeLevel} 
                    onChange={v => setFilters({...filters, gradeLevel: v})}
                    options={[{ label: 'すべて', value: 'all' }, ...Array.from({length:7}, (_,i)=>({label:`${i+1}等級`, value:(i+1).toString()}))]}
                  />
                  <div className="ml-auto flex items-end">
                    <Button variant="ghost" className="text-[10px] font-black text-primary" onClick={() => setFilters({role:'all', department:'all', gradeLevel:'all'})}>
                      リセット
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Loading Personnel...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-40 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-300">検索条件に一致する職員がいません</h3>
            <Button variant="link" className="mt-2 text-primary font-bold" onClick={() => { setSearchTerm(''); setFilters({role:'all', department:'all', gradeLevel:'all'}); }}>
              検索条件をすべてクリア
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredStaff.map((staff, i) => (
                <StaffCard key={staff.id} staff={staff} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <StaffImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchStaff}
      />
    </div>
  )
}

function FilterGroup({ label, value, options, onChange }: { label: string, value: string, options: {label: string, value: string}[], onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button 
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
              value === opt.value 
                ? "bg-gray-900 text-white shadow-lg shadow-gray-200" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StaffCard({ staff, index }: { staff: Staff, index: number }) {
  const roleInfo = ROLE_CONFIG[staff.role] || { label: staff.role || '未設定', icon: Users, color: 'gray', bg: 'bg-gray-50', text: 'text-gray-500' }
  const RoleIcon = roleInfo.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 10) * 0.05 }}
    >
      <Card className="group relative bg-white/70 backdrop-blur-md border border-gray-100 hover:border-primary/20 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-100/10 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center font-black text-2xl text-gray-200 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                {(staff.fullName || '?').charAt(0)}
              </div>
              <div className={clsx("absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center border-2 border-white", roleInfo.text)}>
                <RoleIcon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-right">
               <Badge className={clsx("mb-2 border-none font-black text-[9px] uppercase tracking-tighter", roleInfo.bg, roleInfo.text)}>
                {roleInfo.label}
              </Badge>
              <p className="text-[10px] font-black text-gray-300 tracking-wider">ID: {staff.staffId || '-'}</p>
            </div>
          </div>

          <div className="mb-8">
            {staff.fullNameKana && (
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-0.5">
                {staff.fullNameKana}
              </p>
            )}
            <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors mb-2">
              {staff.fullName || '名前未登録'}
            </h3>
            <div className="flex flex-wrap gap-1.5">
               <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                <Building2 className="w-3 h-3" />
                {staff.department || '部署未設定'}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                <GraduationCap className="w-3 h-3" />
                {staff.gradeLevel || 0}等級
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
             <div>
              <p className="text-[9px] font-black text-gray-300 uppercase mb-1">勤続年数</p>
              <p className="text-xs font-black text-gray-700">{calculateTenure(staff.hireDate)}</p>
            </div>
             <div className="text-right">
              <p className="text-[9px] font-black text-gray-300 uppercase mb-1">累計PT</p>
              <p className="text-lg font-black text-primary leading-none">{(staff.welfarePoints || 0).toLocaleString()}<span className="text-[10px] ml-1">pt</span></p>
            </div>
          </div>
        </div>

        <Link 
          href={`/evaluation/report?userId=${staff.id}`}
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 flex items-center justify-center backdrop-blur-[2px]"
        >
          <div className="bg-white px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-2 font-black text-xs text-primary translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            詳細レポートを見る
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </Card>
    </motion.div>
  )
}
