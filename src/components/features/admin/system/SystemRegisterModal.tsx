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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Building2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  corporations: { id: string, name: string }[]
}

export function SystemRegisterModal({ isOpen, onClose, onSuccess, corporations }: Props) {
  const [activeTab, setActiveTab] = useState('corporation')
  const [loading, setLoading] = useState(false)

  const [corpData, setCorpData] = useState({
    name: '', subdomain: '', address: '', phoneNumber: '', representativeName: '', email: ''
  })

  const [facData, setFacData] = useState({
    name: '', corporationId: '', address: '', phoneNumber: '', email: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const url = activeTab === 'corporation' ? '/api/admin/system/corporations' : '/api/admin/system/facilities'
    const body = activeTab === 'corporation' ? corpData : facData
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(`${activeTab === 'corporation' ? '法人' : '拠点'}を登録しました`)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-gray-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl"><Building2 className="w-6 h-6 text-primary" /></div>
            <div>
              <DialogTitle className="text-2xl font-black">新規システム登録</DialogTitle>
              <DialogDescription className="text-white/40 font-bold">法人や拠点情報の属性入力をここで行います。</DialogDescription>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-8 pb-0">
          <TabsList className="mb-6 w-full bg-gray-50 p-1 rounded-2xl h-14">
            <TabsTrigger value="corporation" className="flex-1 rounded-xl font-black data-[state=active]:bg-white data-[state=active]:shadow-md">法人登録</TabsTrigger>
            <TabsTrigger value="facility" className="flex-1 rounded-xl font-black data-[state=active]:bg-white data-[state=active]:shadow-md">拠点登録</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="px-8 pb-8 max-h-[400px] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'corporation' ? (
                <motion.div key="corp" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">法人名 *</Label>
                    <Input placeholder="法人名" className="h-12 rounded-xl" value={corpData.name} onChange={e => setCorpData({...corpData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">サブドメイン</Label>
                    <Input placeholder="subdomain" className="h-12 rounded-xl" value={corpData.subdomain} onChange={e => setCorpData({...corpData, subdomain: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">代表者名</Label>
                    <Input placeholder="代表者" className="h-12 rounded-xl" value={corpData.representativeName} onChange={e => setCorpData({...corpData, representativeName: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">所在地</Label>
                    <Input placeholder="住所" className="h-12 rounded-xl" value={corpData.address} onChange={e => setCorpData({...corpData, address: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">電話番号</Label>
                    <Input placeholder="TEL" className="h-12 rounded-xl" value={corpData.phoneNumber} onChange={e => setCorpData({...corpData, phoneNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">メールアドレス</Label>
                    <Input type="email" placeholder="Email" className="h-12 rounded-xl" value={corpData.email} onChange={e => setCorpData({...corpData, email: e.target.value})} />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="fac" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">所属法人 *</Label>
                    <select className="w-full h-12 rounded-xl border border-gray-100 px-4 font-bold" value={facData.corporationId} onChange={e => setFacData({...facData, corporationId: e.target.value})} required>
                      <option value="">選択してください</option>
                      {corporations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">拠点名 *</Label>
                    <Input placeholder="施設名" className="h-12 rounded-xl" value={facData.name} onChange={e => setFacData({...facData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">所在地</Label>
                    <Input placeholder="住所" className="h-12 rounded-xl" value={facData.address} onChange={e => setFacData({...facData, address: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">電話番号</Label>
                      <Input placeholder="TEL" className="h-12 rounded-xl" value={facData.phoneNumber} onChange={e => setFacData({...facData, phoneNumber: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">メール</Label>
                      <Input type="email" placeholder="Email" className="h-12 rounded-xl" value={facData.email} onChange={e => setFacData({...facData, email: e.target.value})} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <DialogFooter className="pt-6">
              <Button type="submit" className="w-full h-14 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "登録を実行する"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
