'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, PlusCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BonusFeed from '@/components/features/peer-bonus/BonusFeed'
import SendBonusModal from '@/components/features/peer-bonus/SendBonusModal'

export default function PeerBonusPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> 
            サンクスバッジ（ピアボーナス）
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            日頃の感謝や優れた行動を称え合いましょう
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Button 
            onClick={() => setIsModalOpen(true)}
            size="lg" 
            className="w-full md:w-auto shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            バッジを送る
          </Button>
        </motion.div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="名前やタグで検索..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-sm bg-white"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 md:p-6 min-h-[500px]">
        <BonusFeed searchQuery={searchQuery} />
      </div>

      <SendBonusModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
