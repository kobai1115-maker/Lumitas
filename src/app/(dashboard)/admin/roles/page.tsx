'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Building2, UserCircle, Plus, Search, Trash2, Edit3, Save, X, Settings2 } from 'lucide-react'
import { PositionDefinition, AuthorityLevel } from '@/types'
import { clsx } from 'clsx'

// 初期マスターデータ (モック)
const DEFAULT_POSITIONS: PositionDefinition[] = [
  { id: 'p1', name: '理事長', authority: 'ALL', rank: 1 },
  { id: 'p2', name: '施設長', authority: 'ALL', rank: 2 },
  { id: 'p3', name: '介護課長', authority: 'DEPARTMENT', rank: 3 },
  { id: 'p4', name: '介護主任', authority: 'SUBORDINATES', rank: 4 },
  { id: 'p5', name: 'リーダー', authority: 'SUBORDINATES', rank: 5 },
  { id: 'p6', name: '一般職', authority: 'SELF', rank: 6 },
]

const AUTHORITY_LABELS: Record<AuthorityLevel, { label: string; icon: React.ElementType; color: string; desc: string }> = {
  ALL: { label: '全職員 閲覧', icon: Shield, color: 'text-rose-600 bg-rose-50', desc: '施設全体のデータを閲覧可能' },
  DEPARTMENT: { label: '部署内 閲覧', icon: Building2, color: 'text-indigo-600 bg-indigo-50', desc: '所属する部署のデータを閲覧可能' },
  SUBORDINATES: { label: '直属部下 閲覧', icon: Users, color: 'text-emerald-600 bg-emerald-50', desc: '紐付く部下のデータを閲覧可能' },
  SELF: { label: '本人のみ', icon: UserCircle, color: 'text-gray-600 bg-gray-50', desc: '自分の評価データのみ閲覧可能' }
}

export default function RoleSettingsPage() {
  const [positions, setPositions] = useState<PositionDefinition[]>(DEFAULT_POSITIONS)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<PositionDefinition>>({})

  const handleEdit = (pos: PositionDefinition) => {
    setEditId(pos.id)
    setEditForm(pos)
  }

  const handleSave = () => {
    if (!editId) return
    setPositions(positions.map(p => p.id === editId ? { ...p, ...editForm } as PositionDefinition : p))
    setEditId(null)
  }

  const handleAdd = () => {
    const newPos: PositionDefinition = {
      id: `new-${Date.now()}`,
      name: '新しい役職',
      authority: 'SELF',
      rank: positions.length + 1
    }
    setPositions([...positions, newPos])
    handleEdit(newPos)
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
            <Settings2 className="w-8 h-8 text-primary" />
            職位・権限設定
          </h1>
          <p className="text-sm text-gray-500 font-medium">法人独自の役職名と、閲覧権限の範囲を柔軟に設定できます</p>
        </div>
        <Button onClick={handleAdd} className="rounded-2xl h-11 px-6 font-black bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          役職を追加
        </Button>
      </div>

      <div className="grid gap-4">
        {positions.sort((a,b) => a.rank - b.rank).map((pos) => {
          const auth = AUTHORITY_LABELS[pos.authority]
          const isEditing = editId === pos.id

          return (
            <Card key={pos.id} className={clsx(
              "border-gray-100 shadow-sm transition-all duration-300 overflow-hidden",
              isEditing ? "ring-2 ring-primary/20 shadow-md translate-x-2" : "hover:border-primary/20"
            )}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* 表示/編集切替パネル */}
                  {isEditing ? (
                    <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400">役職名 / ポジション名</label>
                        <Input 
                          value={editForm.name} 
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="例: 副施設長"
                          className="bg-white rounded-xl h-11 border-gray-200 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-gray-400">閲覧権限の範囲</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(AUTHORITY_LABELS) as AuthorityLevel[]).map(level => (
                            <button
                              key={level}
                              onClick={() => setEditForm({...editForm, authority: level})}
                              className={clsx(
                                "text-[10px] p-2.5 rounded-xl font-bold border transition-all text-center",
                                editForm.authority === level 
                                  ? "bg-primary border-primary text-white shadow-md" 
                                  : "bg-white border-gray-100 text-gray-400 hover:border-primary/30"
                              )}
                            >
                              {AUTHORITY_LABELS[level].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-6">
                      <div className="min-w-[140px]">
                        <p className="text-[10px] font-black text-gray-300 mb-1">表示順位: {pos.rank}</p>
                        <h3 className="text-lg font-black text-gray-800">{pos.name}</h3>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-1">
                        <div className={clsx("p-3 rounded-2xl shrink-0", auth.color)}>
                          <auth.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-700 leading-none mb-1">{auth.label}</p>
                          <p className="text-xs text-gray-400 font-medium">{auth.desc}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="p-5 flex md:flex-col border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/50 gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} size="sm" className="bg-primary text-white font-black rounded-lg w-full">
                          <Save className="w-4 h-4 mr-2" />
                          保存
                        </Button>
                        <Button onClick={() => setEditId(null)} variant="ghost" size="sm" className="text-gray-400 font-black rounded-lg w-full">
                          <X className="w-4 h-4 mr-2" />
                          キャンセル
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => handleEdit(pos)} variant="ghost" size="sm" className="text-primary hover:bg-primary/5 font-black rounded-lg w-full flex justify-between px-3">
                          <Edit3 className="w-4 h-4" />
                          編集
                        </Button>
                        <Button 
                          onClick={() => setPositions(positions.filter(p => p.id !== pos.id))}
                          variant="ghost" 
                          size="sm" 
                          className="text-rose-400 hover:text-rose-500 hover:bg-rose-50 font-black rounded-lg w-full flex justify-between px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                          削除
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50 flex gap-4">
        <div className="p-3 bg-orange-100 rounded-2xl h-fit">
          <Shield className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h4 className="font-black text-orange-900 mb-1">権限設定の注意点</h4>
          <p className="text-xs text-orange-800 leading-relaxed font-medium">
            権限を変更すると、該当する役職の職員が閲覧できるデータ範囲が即座に切り替わります。<br />
            「部署内 閲覧」は、職員のプロフィールに設定された部署コードをもとに自動的にフィルタリングされます。
          </p>
        </div>
      </div>
    </motion.div>
  )
}
