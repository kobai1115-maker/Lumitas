'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClipboardCheck, Search, Clock, User, Coffee, Bath, Activity, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { clsx } from 'clsx'

export default function CareRecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRecords = records.filter((r: any) => 
    r.resident?.includes(searchTerm) || r.type?.includes(searchTerm)
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-primary" />
            ケア記録管理
          </h1>
          <p className="text-sm text-gray-500 font-medium">本日の入居者様のケア状況を確認・入力します</p>
        </div>
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="入居者名や記録種別で検索..." 
            className="pl-10 rounded-xl bg-white border-gray-100 focus:ring-primary/20 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryItem label="本日の予定" value={0} unit="件" color="bg-gray-100 text-gray-600" />
        <SummaryItem label="完了済み" value={0} unit="件" color="bg-green-100 text-green-600" />
        <SummaryItem label="未完了" value={0} unit="件" color="bg-rose-100 text-rose-600" />
        <SummaryItem label="記録達成率" value="0" unit="%" color="bg-indigo-100 text-indigo-600" />
      </div>

      <Card className="border-gray-100 shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2 border-b border-gray-50 bg-gray-50/30">
          <CardTitle className="text-xs font-black text-gray-400 tracking-widest uppercase flex items-center gap-2">
            <Clock className="w-4 h-4" />
            TimeLine / Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {filteredRecords.map((record) => (
              <motion.div 
                key={record.id}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.01)' }}
                className="p-4 flex items-center gap-4 group cursor-pointer transition-colors"
              >
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", record.color)}>
                  <record.icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 truncate">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {record.resident}
                    </h3>
                    <Badge className={clsx(
                      "rounded-full px-2 py-0.5 text-[10px] font-black border-none",
                      record.status === '完了' ? "bg-green-100 text-green-600" : "bg-rose-100 text-rose-600"
                    )}>
                      {record.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                      <Clock className="w-3 h-3" />
                      {record.time}
                    </div>
                    <div className="text-[11px] font-black text-primary px-1.5 py-0.5 bg-primary/5 rounded-md">
                      {record.type}
                    </div>
                    <div className="text-xs text-gray-500 truncate ml-2">
                      {record.detail}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-primary transition-colors" />
              </motion.div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                <Search className="w-12 h-12 mb-4 opacity-10" />
                <p className="font-bold">該当する記録が見つかりません</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-2">
        <Button className="rounded-2xl px-8 h-12 font-black bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10">
          さらに表示する
        </Button>
      </div>
    </motion.div>
  )
}

function SummaryItem({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string; }) {
  return (
    <Card className="border-none shadow-sm bg-white/50">
      <CardContent className="p-4 text-center">
        <p className="text-[11px] font-black text-gray-400 mb-1">{label}</p>
        <div className={clsx("inline-flex items-baseline gap-0.5 font-black p-1 px-3 rounded-full", color)}>
          <span className="text-2xl">{value}</span>
          <span className="text-[11px]">{unit}</span>
        </div>
      </CardContent>
    </Card>
  )
}
