'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  MapPin, 
  Plus, 
  Search, 
  Globe, 
  Phone, 
  Mail, 
  User as UserIcon,
  Users,
  ChevronRight,
  Loader2,
  ShieldCheck,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  Settings2,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SystemRegisterModal } from '@/components/features/admin/system/SystemRegisterModal'
import { BulkImportTab } from '@/components/features/admin/system/BulkImportTab'
import { toast } from "sonner"
import { clsx } from 'clsx'

// 型定義
type Corporation = {
  id: string
  name: string
  subdomain?: string
  address?: string
  phoneNumber?: string
  representativeName?: string
  email?: string
  isActive: boolean
  createdAt: string
  _count: {
    facilities: number
    users: number
  }
}

type Facility = {
  id: string
  name: string
  Corporation?: { name: string } | null
  address?: string
  phoneNumber?: string
  email?: string
  _count: {
    units: number
    users: number
  }
}

type User = {
  id: string
  fullName: string
  email: string
  staffId: string
  corporationId: string | null
  Corporation?: { name: string } | null
  createdAt: string
}

export default function SystemAdminPage() {
  const [corps, setCorps] = useState<Corporation[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [mainAdmins, setMainAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('corporations')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [editCorpData, setEditCorpData] = useState<Corporation | null>(null)

  // データ取得
  async function fetchData() {
    setLoading(true)
    try {
      const [corpsRes, facsRes, adminsRes] = await Promise.all([
        fetch('/api/admin/system/corporations'),
        fetch('/api/admin/system/facilities'),
        fetch('/api/admin/system/users?role=MAIN_ADMIN')
      ])
      
      if (corpsRes.ok) setCorps(await corpsRes.json())
      if (facsRes.ok) setFacilities(await facsRes.json())
      if (adminsRes.ok) setMainAdmins(await adminsRes.json())
    } catch (err) {
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCorp = async (id: string, name: string) => {
    if (!confirm(`法人「${name}」を削除(無効化)しますか？この操作により関連データへのアクセスが制限されます。`)) return
    try {
      const res = await fetch(`/api/admin/system/corporations?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`法人「${name}」を削除しました`)
        fetchData()
      } else {
        toast.error('法人の削除に失敗しました')
      }
    } catch (err) {
      toast.error('通信エラーが発生しました')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredCorps = corps.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) && c.isActive)
  const filteredFacs = facilities.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || (f.Corporation?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredAdmins = mainAdmins.filter(a => a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || (a.Corporation?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">システム情報を同期中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 md:px-0 pb-32">
      {/* プレミアム・ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-3 bg-primary rounded-[1.25rem] text-white shadow-2xl shadow-primary/20">
               <ShieldCheck className="w-7 h-7" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-none mb-2">システム管理ポータル</h1>
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">全法人・拠点の統合マネジメント</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="法人名・拠点名で検索..." 
              className="h-14 pl-12 pr-6 rounded-2xl border-gray-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all w-64 md:w-80 font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            className="h-14 px-8 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200"
            onClick={() => setIsRegisterModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-3 text-primary" />
            新規登録
          </Button>
        </div>
      </div>

      <SystemRegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => {
          setIsRegisterModalOpen(false)
          setEditCorpData(null)
        }}
        onSuccess={fetchData}
        corporations={corps.map(c => ({ id: c.id, name: c.name }))}
        editCorpData={editCorpData}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="mb-8 p-1.5 bg-gray-100/50 rounded-2xl h-auto self-start flex-wrap gap-2">
          <TabsTrigger value="corporations" className="px-8 py-3 rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg active:scale-95 transition-all">
            <Building2 className="w-4 h-4 mr-2" />
            法人管理
          </TabsTrigger>
          <TabsTrigger value="facilities" className="px-8 py-3 rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg active:scale-95 transition-all">
            <MapPin className="w-4 h-4 mr-2" />
            拠点・施設管理
          </TabsTrigger>
          <TabsTrigger value="main_admins" className="px-8 py-3 rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg active:scale-95 transition-all">
            <ShieldCheck className="w-4 h-4 mr-2" />
            メイン管理者
          </TabsTrigger>
          <TabsTrigger value="users-import" className="px-8 py-3 rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg active:scale-95 transition-all bg-indigo-50/50 text-indigo-900 border border-indigo-100/50 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            ユーザー一括インポート
          </TabsTrigger>
        </TabsList>

        <TabsContent value="corporations" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCorps.map((corp) => (
              <motion.div
                key={corp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="border-none shadow-2xl shadow-gray-100 rounded-[2.5rem] bg-white overflow-hidden hover:shadow-primary/5 transition-all duration-500">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-inner">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-2 rounded-lg font-black bg-gray-50/50 text-[10px] uppercase tracking-wider border-none">
                            {corp.subdomain ? `${corp.subdomain}.lumitas.local` : '独自ドメイン未設定'}
                          </Badge>
                          <CardTitle className="text-2xl font-black tracking-tight text-gray-900 leading-tight">
                            {corp.name}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl hover:bg-gray-50"
                          onClick={() => {
                            setEditCorpData(corp)
                            setIsRegisterModalOpen(true)
                          }}
                        >
                          <Settings2 className="w-5 h-5 text-gray-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl hover:bg-rose-50 hover:text-rose-500"
                          onClick={() => handleDeleteCorp(corp.id, corp.name)}
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">管理拠点数</p>
                         <p className="text-2xl font-black text-gray-900">{corp._count.facilities} <span className="text-xs font-bold text-gray-400 italic">locations</span></p>
                      </div>
                      <div className="p-4 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">総ユーザ数</p>
                         <p className="text-2xl font-black text-gray-900">{corp._count.users} <span className="text-xs font-bold text-gray-400 italic">users</span></p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                      <DetailRow icon={UserIcon} label="代表者" value={corp.representativeName || '未登録'} />
                      <DetailRow icon={MapPin} label="所在地" value={corp.address || '未登録'} />
                      <DetailRow icon={Phone} label="連絡先" value={corp.phoneNumber || '未登録'} />
                      <DetailRow icon={Mail} label="メール" value={corp.email || '未登録'} />
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all">
                        詳細を確認
                      </Button>
                      <Button variant="outline" className="h-12 w-12 rounded-xl border-gray-100 hover:bg-gray-50">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="facilities" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFacs.map((fac) => (
              <motion.div
                key={fac.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group"
              >
                <Card className="border-none shadow-xl shadow-gray-100 rounded-[2rem] bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/10">
                  <CardHeader className="p-6">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <Badge variant="secondary" className="rounded-lg font-black text-[9px] uppercase tracking-widest py-0 px-2 opacity-60">
                           {fac.Corporation?.name || '無所属'}
                        </Badge>
                     </div>
                     <CardTitle className="text-xl font-black tracking-tight text-gray-900 truncate">
                        {fac.name}
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                     <div className="space-y-2">
                        <DetailRow icon={MapPin} value={fac.address || '住所未登録'} small />
                        <DetailRow icon={Phone} value={fac.phoneNumber || '電話未登録'} small />
                        <DetailRow icon={LayoutGrid} value={`ユニット数: ${fac._count.units}`} small />
                     </div>
                     <Button variant="ghost" className="w-full justify-between h-12 rounded-xl font-bold text-gray-500 hover:text-primary hover:bg-primary/5 group/btn">
                        拠点詳細を表示
                        <ChevronRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                     </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="main_admins" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAdmins.map((admin) => (
              <motion.div key={admin.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group">
                <Card className="border-none shadow-xl shadow-gray-100 rounded-[2rem] bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/10">
                  <CardHeader className="p-6">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <Badge variant="secondary" className="rounded-lg font-black text-[9px] uppercase tracking-widest py-0 px-2 opacity-60">
                           {admin.Corporation?.name || '無所属'}
                        </Badge>
                     </div>
                     <CardTitle className="text-xl font-black tracking-tight text-gray-900 truncate">
                        {admin.fullName}
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                     <div className="space-y-2">
                        <DetailRow icon={Mail} value={admin.email} small />
                        <DetailRow icon={UserIcon} value={`スタッフID: ${admin.staffId}`} small />
                     </div>
                     <Button variant="ghost" className="w-full justify-center h-12 rounded-xl font-bold text-gray-500 hover:text-amber-600 hover:bg-amber-50 group/btn">
                        権限・活動状況を確認
                     </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filteredAdmins.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 font-bold">メイン管理者が見つかりません。</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users-import" className="m-0">
          <BulkImportTab corporations={corps} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value, small }: { icon: any, label?: string, value: string, small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={clsx("flex-shrink-0 text-gray-300", small ? "w-3.5 h-3.5" : "w-4 h-4")}>
        <Icon className="w-full h-full" />
      </div>
      <div className="flex flex-col">
        {label && <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">{label}</span>}
        <span className={clsx("font-bold text-gray-600 truncate", small ? "text-[11px]" : "text-xs")}>{value}</span>
      </div>
    </div>
  )
}
