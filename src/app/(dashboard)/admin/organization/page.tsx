'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Network, 
  Plus, 
  Download, 
  Upload, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal, 
  Layers,
  MapPin,
  Users2,
  Loader2,
  Search,
  FileSpreadsheet,
  Pencil,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrganizationImportModal } from '@/components/features/admin/OrganizationImportModal'
import { OrgItemRegisterModal, OrgItemType } from '@/components/features/admin/OrgItemRegisterModal'
import { Badge } from '@/components/ui/badge'
import { toast } from "sonner"
import { clsx } from 'clsx'

// 型定義
type Unit = { id: string; name: string }
type Facility = { id: string; name: string; units: Unit[] }
type Division = { id: string; name: string; facilities: Facility[] }
type Organization = {
  id: string
  name: string
  divisions: Division[]
  facilities: Facility[] // 部門に属さない事業所
}

export default function AdminOrganizationPage() {
  const [orgData, setOrgData] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({ 'root': true })
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  
  const [registerModal, setRegisterModal] = useState<{
    isOpen: boolean,
    type: OrgItemType | null,
    parentId: string | null,
    parentName: string | null,
    editId?: string | null,
    initialName?: string
  }>({
    isOpen: false,
    type: null,
    parentId: null,
    parentName: null
  })

  // テンプレートダウンロード機能
  const downloadTemplate = async () => {
    const XLSX = await import('xlsx')
    const data = [
      { '部門名': '入所部', '事業所名': 'A特別養護老人ホーム', 'ユニット名': '1Fさくら' },
      { '部門名': '入所部', '事業所名': 'A特別養護老人ホーム', 'ユニット名': '2Fひまわり' },
      { '部門名': '在宅支援部', '事業所名': 'Bケアプランセンター', 'ユニット名': '' },
      { '部門名': '', '事業所名': '地域包括支援センター', 'ユニット名': '' }
    ]
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'OrganizationTemplate')
    XLSX.writeFile(wb, 'Organization_Hierarchy_Template.xlsx')
    toast.success('テンプレートをダウンロードしました')
  }

  // データ取得
  async function fetchOrg() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/organization')
      if (res.ok) {
        const data = await res.json()
        setOrgData(data)
      }
    } catch (err) {
      toast.error('組織データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrg()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const openRegisterModal = (type: OrgItemType, parentId: string, parentName: string) => {
    setRegisterModal({
      isOpen: true,
      type,
      parentId: parentId === 'root' ? null : parentId,
      parentName,
      editId: null,
      initialName: ''
    })
  }

  const handleEdit = (type: OrgItemType, id: string, name: string) => {
    setRegisterModal({
      isOpen: true,
      type,
      parentId: null,
      parentName: null,
      editId: id,
      initialName: name
    })
  }

  const handleDelete = async (type: OrgItemType, id: string, name: string) => {
    if (!window.confirm(`本当に「${name}」を削除しますか？\n※関連するデータが存在する場合は削除できません。`)) return
    
    try {
      const res = await fetch(`/api/admin/organization?type=${type}&id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`「${name}」を削除しました`)
        fetchOrg()
      } else {
        const err = await res.json()
        toast.error(err.error || '削除に失敗しました')
      }
    } catch {
      toast.error('通信エラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">組織構造を解析中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 md:px-0 pb-32">
      {/* プレミアム・ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-3 bg-gray-900 rounded-[1.25rem] text-white shadow-2xl shadow-gray-200">
               <Network className="w-7 h-7" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-none mb-2">組織構造管理</h1>
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">マルチテナント・階層型組織マネジメント</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold border-gray-100 hover:bg-gray-50 group" onClick={downloadTemplate}>
            <Download className="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-900 transition-colors" />
            テンプレートDL
          </Button>
          <Button 
            className="h-14 px-8 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200"
            onClick={() => setIsImportModalOpen(true)}
          >
            <FileSpreadsheet className="w-5 h-5 mr-3 text-primary" />
            Excelで一括登録
          </Button>
        </div>
      </div>

      {/* インポートモーダル */}
      <OrganizationImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={fetchOrg}
      />

      {/* 個別登録モーダル */}
      <OrgItemRegisterModal 
        isOpen={registerModal.isOpen}
        onClose={() => setRegisterModal(prev => ({ ...prev, isOpen: false }))}
        onSuccess={fetchOrg}
        type={registerModal.type}
        parentId={registerModal.parentId}
        parentName={registerModal.parentName}
        editId={registerModal.editId}
        initialName={registerModal.initialName}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 左側：ツリー表示 */}
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-100 rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                組織図
              </CardTitle>
              <Badge variant="outline" className="rounded-lg font-bold bg-white">{orgData?.name}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              <TreeItem 
                id="root" 
                label={orgData?.name || ''} 
                level={0} 
                icon={Building2} 
                isExpanded={expandedItems['root']}
                onToggle={() => toggleExpand('root')}
                onAdd={() => openRegisterModal('DIVISION', 'root', orgData?.name || '')}
              >
                {/* 部門 (Divisions) */}
                {orgData?.divisions.map(div => (
                  <TreeItem 
                    key={div.id} 
                    id={div.id} 
                    label={div.name} 
                    level={1} 
                    icon={Layers} 
                    isExpanded={expandedItems[div.id]}
                    onToggle={() => toggleExpand(div.id)}
                    onAdd={() => openRegisterModal('FACILITY', div.id, div.name)}
                    onEdit={() => handleEdit('DIVISION', div.id, div.name)}
                    onDelete={() => handleDelete('DIVISION', div.id, div.name)}
                    badge="部門"
                  >
                    {div.facilities.map(fac => (
                      <TreeItem 
                        key={fac.id} 
                        id={fac.id} 
                        label={fac.name} 
                        level={2} 
                        icon={MapPin}
                        isExpanded={expandedItems[fac.id]}
                        onToggle={() => toggleExpand(fac.id)}
                        onAdd={() => openRegisterModal('UNIT', fac.id, fac.name)}
                        onEdit={() => handleEdit('FACILITY', fac.id, fac.name)}
                        onDelete={() => handleDelete('FACILITY', fac.id, fac.name)}
                        badge="事業所"
                      >
                         {fac.units.map(unit => (
                           <TreeItem 
                             key={unit.id} 
                             id={unit.id} 
                             label={unit.name} 
                             level={3} 
                             icon={Users2}
                             onEdit={() => handleEdit('UNIT', unit.id, unit.name)}
                             onDelete={() => handleDelete('UNIT', unit.id, unit.name)}
                             badge="ユニット"
                           />
                         ))}
                      </TreeItem>
                    ))}
                  </TreeItem>
                ))}

                {/* 部門に属さない事業所 */}
                {orgData?.facilities.map(fac => (
                  <TreeItem 
                    key={fac.id} 
                    id={fac.id} 
                    label={fac.name} 
                    level={1} 
                    icon={MapPin} 
                    isExpanded={expandedItems[fac.id]}
                    onToggle={() => toggleExpand(fac.id)}
                    onAdd={() => openRegisterModal('UNIT', fac.id, fac.name)}
                    onEdit={() => handleEdit('FACILITY', fac.id, fac.name)}
                    onDelete={() => handleDelete('FACILITY', fac.id, fac.name)}
                    badge="事業所 (直轄)"
                  >
                    {fac.units.map(unit => (
                      <TreeItem 
                        key={unit.id} 
                        id={unit.id} 
                        label={unit.name} 
                        level={2} 
                        icon={Users2}
                        onEdit={() => handleEdit('UNIT', unit.id, unit.name)}
                        onDelete={() => handleDelete('UNIT', unit.id, unit.name)}
                        badge="ユニット"
                      />
                    ))}
                  </TreeItem>
                ))}
              </TreeItem>
            </div>
          </CardContent>
        </Card>

        {/* 右側：統計・案内 */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl shadow-gray-100 rounded-[2rem] bg-gray-900 text-white overflow-hidden">
            <CardHeader className="p-6 pb-0">
               <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-primary" />
                 クイックインサイト
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <StatRow label="全部門数" value={orgData?.divisions?.length || 0} />
                <StatRow label="全事業所数" value={(orgData?.divisions?.reduce((acc, d) => acc + (d.facilities?.length || 0), 0) || 0) + (orgData?.facilities?.length || 0)} />
                <StatRow label="ユニット総数" value="自動集計中..." />
               <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-wider">
                    部・事業所を追加することで、職員の評価範囲やインシデント報告の集計区分を柔軟に切り替えることが可能になります。
                  </p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TreeItem({ 
  id, 
  label, 
  level, 
  icon: Icon, 
  children, 
  isExpanded, 
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  badge
}: { 
  id: string, 
  label: string, 
  level: number, 
  icon: any, 
  children?: React.ReactNode, 
  isExpanded?: boolean,
  onToggle?: () => void,
  onAdd?: () => void,
  onEdit?: () => void,
  onDelete?: () => void,
  badge?: string
}) {
  const hasChildren = !!children && Array.isArray(children) ? children.length > 0 : !!children

  return (
    <div className="select-none">
      <div 
        className={clsx(
          "flex items-center justify-between p-3 rounded-2xl transition-all duration-200 cursor-pointer group",
          level === 0 ? "bg-gray-50/50" : "hover:bg-gray-50"
        )}
        onClick={onToggle}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6">
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
            ) : null}
          </div>
          <div className={clsx(
            "p-2 rounded-xl transition-colors shrink-0",
            level === 0 ? "bg-gray-900 text-white" : "bg-white border border-gray-100 text-gray-400 group-hover:bg-primary group-hover:text-white"
          )}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={clsx(
            "font-black tracking-tight truncate min-w-0",
            level === 0 ? "text-lg text-gray-900" : "text-sm text-gray-600"
          )} title={label}>{label}</span>
          {badge && <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest py-0 px-2 opacity-50 shrink-0">{badge}</Badge>}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {onAdd && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              <Plus className="w-3.5 h-3.5 text-gray-400" />
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="w-3.5 h-3.5 text-blue-400" />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </Button>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-white/50">{label}</span>
      <span className="text-lg font-black text-primary">{value}</span>
    </div>
  )
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3a2 2 0 0 0 0 4" />
      <path d="M19 17a2 2 0 0 0 0 4" />
    </svg>
  )
}
