'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Loader2, BookOpen, Award } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type TrainingRecord = {
  id: string
  title: string
  type: 'OJT' | 'OFF_JT'
  date: string
  hours: number
  reportContent: string | null
  earnedPoints: number
  pointsGranted: boolean
}

export default function TrainingPage() {
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState<string>('demo-user-id')

  // Form states
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'OJT' | 'OFF_JT'>('OJT')
  const [date, setDate] = useState('')
  const [hours, setHours] = useState('1')
  const [reportContent, setReportContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchUserAndRecords = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUserId = session?.user?.id || 'demo-user-id'
      setUserId(currentUserId)
      
      try {
        const res = await fetch(`/api/training?userId=${currentUserId}`)
        if (res.ok) {
          const data = await res.json()
          setRecords(data)
        }
      } catch (error) {
        console.error('Error fetching training records:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserAndRecords()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          type,
          date,
          hours,
          reportContent
        })
      })

      if (res.ok) {
        const data = await res.json()
        setRecords([data.record, ...records])
        setIsOpen(false)
        setTitle('')
        setReportContent('')
        setDate('')
        setHours('1')
      } else {
        alert('エラーが発生しました')
      }
    } catch (error) {
      console.error(error)
      alert('ネットワークエラー')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            研修参加記録
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            内部研修（OJT）および外部研修（OffJT）の参加履歴と獲得ポイント
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2 shadow-sm rounded-full px-5 hover:scale-105 transition-transform">
                <PlusCircle className="w-4 h-4" /> 記録を追加
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md bg-white rounded-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">研修参加を記録</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">研修のタイトル</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="例: 高齢者虐待防止研修"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">種別</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'OJT' | 'OFF_JT')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="OJT">OJT (内部研修・5pt)</option>
                    <option value="OFF_JT">Off-JT (外部研修・10pt)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">参加日</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">研修時間 (h)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学び・感想など</label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 resize-none"
                  placeholder="研修で学んだことや今後の業務にどう活かすかを記入"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  記録してポイントを獲得
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
        </div>
      ) : records.length === 0 ? (
        <Card className="bg-gray-50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mb-4 opacity-50" />
            <p>まだ研修の参加記録がありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((r) => (
            <Card key={r.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex border-l-4 border-l-primary">
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.type === 'OJT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {r.type === 'OJT' ? '内部 OJT' : '外部 Off-JT'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(r.date).toLocaleDateString('ja-JP')}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {r.hours}時間
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{r.title}</h3>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-primary/10 px-4 py-2 rounded-xl">
                        <Award className="w-5 h-5 text-primary mb-1" />
                        <span className="text-sm font-black text-primary">+{r.earnedPoints} pt</span>
                      </div>
                    </div>
                    {r.reportContent && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2 bg-gray-50 p-3 rounded-lg">
                        {r.reportContent}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
