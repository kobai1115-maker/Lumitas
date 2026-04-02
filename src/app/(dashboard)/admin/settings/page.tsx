'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, MapPin, Phone, Plus, Trash2, Edit3, Save, X, Settings, Map, Shield, GripVertical } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
  const [corpName, setCorpName] = useState('社会福祉法人 萌佑会')
  const [locations, setLocations] = useState<FacilityLocation[]>([
    { id: 'l1', name: '特養 東館', type: '特別養護老人ホーム', address: '東京都〇〇区△△ 1-2-3', phone: '03-1111-1111' },
    { id: 'l2', name: 'ルミタス・ケアステーション', type: '訪問介護', address: '神奈川県〇〇市×× 4-5-6', phone: '045-222-2222' },
    { id: 'l3', name: 'デイサービス ひだまり', type: '通所介護', address: '東京都〇〇区□□ 7-8-9', phone: '03-3333-3333' },
  ])

  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<FacilityLocation>>({})

  const handleEdit = (loc: FacilityLocation) => {
    setEditId(loc.id)
    setEditForm(loc)
  }

  const handleSaveLocation = () => {
    setLocations(locations.map(l => l.id === editId ? { ...l, ...editForm } as FacilityLocation : l))
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
          <p className="text-sm text-gray-500 font-medium">ドラッグして拠点の並び順を変更できます</p>
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
              <Button onClick={() => alert('保存しました')} className="w-full rounded-2xl h-11 font-black shadow-lg shadow-primary/20">
                法人名を保存
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 拠点一覧・編集 (メイン) */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-[10px] font-black text-gray-400 px-1 uppercase tracking-widest leading-none">拠点リスト（掴んで移動可能）</p>
          
          <Reorder.Group axis="y" values={locations} onReorder={setLocations} className="space-y-4">
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
                            <Button onClick={handleSaveLocation} className="rounded-xl font-black px-8">変更を保存</Button>
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
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-gray-900 leading-none">{loc.name}</h3>
                                <Badge className="bg-gray-100 text-gray-500 border-none text-[9px] font-black">{loc.type}</Badge>
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="flex items-center gap-1.5 text-xs text-gray-400 font-medium"><MapPin className="w-3 h-3" />{loc.address}</p>
                                <p className="flex items-center gap-1.5 text-xs text-gray-400 font-medium"><Phone className="w-3 h-3" />{loc.phone}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button onClick={() => handleEdit(loc)} variant="ghost" size="sm" className="rounded-xl text-primary font-bold hover:bg-primary/5">
                              <Edit3 className="w-4 h-4 mr-2" />
                              編集
                            </Button>
                            <Button onClick={() => setLocations(locations.filter(l => l.id !== loc.id))} variant="ghost" size="sm" className="rounded-xl text-rose-400 font-bold hover:bg-rose-50 hover:text-rose-500">
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
