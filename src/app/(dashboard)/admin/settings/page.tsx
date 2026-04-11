import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, MapPin, Phone, Plus, Trash2, Edit3, Shield, GripVertical, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import { Reorder } from 'framer-motion'

export type FacilityLocation = {
  id: string
  name: string
  type: string
  address: string
  phone: string
}

export default function AdminSettingsPage() {
  const [corpName, setCorpName] = useState('')
  const [locations, setLocations] = useState<FacilityLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<FacilityLocation>>({})

  // データ取得
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setCorpName(data.name)
        setLocations(data.facilities.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.type || '未設定',
          address: f.address || '',
          phone: f.phoneNumber || ''
        })))
      }
    } catch (err) {
      toast.error('設定情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 保存処理
  const saveSettings = async (newLocations?: FacilityLocation[], newName?: string) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName ?? corpName,
          facilities: newLocations ?? locations
        })
      })

      if (res.ok) {
        toast.success('設定を保存しました')
        if (newLocations) setLocations(newLocations)
        if (newName) setCorpName(newName)
        fetchData() // 再取得して状態を同期
      } else {
        toast.error('保存に失敗しました')
      }
    } catch (err) {
      toast.error('通信エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (loc: FacilityLocation) => {
    setEditId(loc.id)
    setEditForm(loc)
  }

  const handleSaveLocation = async () => {
    const updated = locations.map(l => l.id === editId ? { ...l, ...editForm } as FacilityLocation : l)
    await saveSettings(updated)
    setEditId(null)
  }

  const addNewLocation = () => {
    const newLoc = { 
      id: `l-${Date.now()}`, 
      name: '新しい拠点', 
      type: '種別を選択', 
      address: '', 
      phone: '' 
    }
    setLocations([...locations, newLoc])
    handleEdit(newLoc)
  }

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('この拠点を削除してもよろしいですか？')) return
    const updated = locations.filter(l => l.id !== id)
    await saveSettings(updated)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-black tracking-widest uppercase text-xs">Loading Settings...</p>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            法人・拠点管理
          </h1>
          <p className="text-sm text-gray-500 font-medium">ドラッグして拠点の並び順を変更できます（並び順も保存されます）</p>
        </div>
        <Button onClick={addNewLocation} className="rounded-2xl h-11 px-6 font-black bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-lg shadow-primary/5">
          <Plus className="w-4 h-4" />
          新しい拠点を追加
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 法人基本情報 (サイド) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-gray-100 shadow-xl overflow-hidden sticky top-6">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50">
              <CardTitle className="text-sm font-black text-gray-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                法人共通設定
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400">法人名（会社名）</Label>
                <Input 
                  value={corpName} 
                  onChange={e => setCorpName(e.target.value)}
                  className="rounded-xl h-11 border-gray-200"
                />
              </div>
              <Button 
                onClick={() => saveSettings()} 
                disabled={isSaving}
                className="w-full rounded-2xl h-11 font-black shadow-lg shadow-primary/20"
              >
                {isSaving ? "保存中..." : "法人名を保存"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 拠点一覧・編集 (メイン) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">拠点リスト（掴んで移動可能）</p>
             {/* 並び順を確定させるためのボタン（もし自動保存しない場合用。今回は自動保存でも良いが、Reorder完了時にトリガーする） */}
          </div>
          
          <Reorder.Group 
            axis="y" 
            values={locations} 
            onReorder={(newOrder) => {
              setLocations(newOrder)
              // 並び替えの直後に保存（オプション）
              saveSettings(newOrder)
            }} 
            className="space-y-4"
          >
            {locations.map((loc) => {
              const isEditing = editId === loc.id
              return (
                <Reorder.Item 
                  key={loc.id} 
                  value={loc}
                  className={clsx(
                    "cursor-default list-none", 
                    isEditing ? "relative z-10" : ""
                  )}
                >
                  <Card className={clsx(
                    "border-gray-100 shadow-sm transition-all duration-300",
                    isEditing ? "ring-2 ring-primary border-primary/20 shadow-xl" : "hover:shadow-md hover:border-primary/10 select-none"
                  )}>
                    <CardContent className="p-0">
                      {isEditing ? (
                        <div className="p-6 space-y-4 bg-gray-50/30 rounded-2xl">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-black text-gray-400">施設・拠点名</Label>
                              <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="rounded-xl h-11 bg-white" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-black text-gray-400">サービス種別</Label>
                              <Input value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="rounded-xl h-11 bg-white" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-xs font-black text-gray-400">所在地（住所）</Label>
                              <Input value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="rounded-xl h-11 bg-white" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-black text-gray-400">電話番号</Label>
                              <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="rounded-xl h-11 bg-white" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button onClick={() => setEditId(null)} variant="ghost" className="rounded-xl font-bold">キャンセル</Button>
                            <Button onClick={handleSaveLocation} disabled={isSaving} className="rounded-xl font-black px-8">
                              {isSaving ? "保存中..." : "変更を保存"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {/* ドラッグハンドル */}
                            <div className="flex items-center self-stretch pr-2 border-r border-gray-100 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 transition-colors">
                              <GripVertical className="w-5 h-5" />
                            </div>

                            <div className="p-3 bg-primary/5 rounded-2xl text-primary shrink-0">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-gray-900 leading-none truncate">{loc.name}</h3>
                                <Badge className="bg-gray-100 text-gray-500 border-none text-[9px] font-black shrink-0">{loc.type}</Badge>
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="flex items-center gap-1.5 text-xs text-gray-400 font-medium truncate" title={loc.address}>
                                  <MapPin className="w-3 h-3 shrink-0" />{loc.address || '住所未設定'}
                                </p>
                                <p className="flex items-center gap-1.5 text-xs text-gray-400 font-medium"><Phone className="w-3 h-3 shrink-0" />{loc.phone || '電話番号未設定'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button onClick={() => handleEdit(loc)} variant="ghost" size="sm" className="rounded-xl text-primary font-bold hover:bg-primary/5">
                              <Edit3 className="w-4 h-4 mr-2" />
                              編集
                            </Button>
                            <Button onClick={() => handleDeleteLocation(loc.id)} variant="ghost" size="sm" className="rounded-xl text-rose-400 font-bold hover:bg-rose-50 hover:text-rose-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
        </div>
      </div>
    </motion.div>
  )
}
