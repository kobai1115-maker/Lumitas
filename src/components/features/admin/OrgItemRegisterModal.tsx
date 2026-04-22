'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Building2, Layers, Users2 } from 'lucide-react'
import { toast } from 'sonner'

export type OrgItemType = 'DIVISION' | 'FACILITY' | 'UNIT'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  type: OrgItemType | null
  parentId: string | null
  parentName: string | null
  editId?: string | null
  initialName?: string
}

const TYPE_CONFIG = {
  DIVISION: { label: '部門', icon: Layers, description: '法人直下の組織（例：特養部門、在宅部門）を追加します。' },
  FACILITY: { label: '事業所', icon: Building2, description: 'サービス提供の拠点となる施設を追加します。' },
  UNIT: { label: 'ユニット・部署', icon: Users2, description: '事業所内の具体的なチームやフロアを追加します。' }
}

export function OrgItemRegisterModal({ isOpen, onClose, onSuccess, type, parentId, parentName, editId, initialName }: Props) {
  const [name, setName] = useState(initialName || '')
  const [loading, setLoading] = useState(false)

  const config = type ? TYPE_CONFIG[type] : null
  const Icon = config?.icon || Plus

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !type) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name, parentId })
      })

      if (res.ok) {
        toast.success(`${config?.label} 「${name}」を登録しました`)
        setName('')
        onSuccess()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || '登録に失敗しました')
      }
    } catch (err) {
      toast.error('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!config) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-gray-900 p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black">{config.label}の追加</DialogTitle>
              <DialogDescription className="text-white/40 font-bold">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            {parentName && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">追加先</p>
                <p className="font-black text-gray-900">{parentName}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {config.label}名 *
              </Label>
              <Input 
                placeholder={`${config.label}の名前を入力`} 
                className="h-14 rounded-2xl border-gray-100 focus:ring-primary shadow-sm font-bold"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 flex items-center gap-3">
             <Button 
                type="button" 
                variant="ghost" 
                className="rounded-xl font-bold"
                onClick={onClose}
             >
               キャンセル
             </Button>
             <Button 
                type="submit" 
                className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-black hover:bg-gray-800 disabled:bg-gray-200"
                disabled={loading || !name.trim()}
             >
               {loading ? <Loader2 className="animate-spin mr-2" /> : `${config.label}を登録`}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
