import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MessageSquareHeart, Reply, MoreVertical, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function BonusFeed({ searchQuery }: { searchQuery: string }) {
  const [feed, setFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeed = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/peer-bonus')
      if (res.ok) {
        const data = await res.json()
        setFeed(data.map((b: any) => ({
          id: b.id,
          senderName: b.sender?.fullName || '不明',
          receiverName: b.receiver?.fullName || '不明',
          points: b.points,
          tag: b.tag || '#感謝',
          message: b.message,
          createdAt: new Date(b.createdAt),
          reactions: 0 // 現状は0固定
        })))
      }
    } catch (err) {
      toast.error('フィードの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [])

  // 検索フィルタリング
  const filteredFeed = feed.filter(b => 
    b.message.includes(searchQuery) || 
    b.senderName.includes(searchQuery) || 
    b.receiverName.includes(searchQuery) ||
    b.tag.includes(searchQuery)
  )

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-bold">フィードを読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredFeed.map((bonus, index) => (
        <motion.div
          key={bonus.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="border-b border-gray-100 last:border-0 pb-4 last:pb-0 relative"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-3 shrink-0 md:w-64">
              <Avatar className="w-10 h-10 border border-gray-100">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {bonus.senderName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium leading-none mb-1">From</span>
                <span className="text-sm font-bold text-gray-800">{bonus.senderName}</span>
              </div>
              <div className="text-gray-300 mx-1">▶︎</div>
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-white text-xs font-bold">
                  {bonus.receiverName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium leading-none mb-1">To</span>
                <span className="text-sm font-bold text-gray-800">{bonus.receiverName}</span>
              </div>
            </div>

            <div className="flex-1 bg-gray-50/50 p-4 rounded-xl border border-gray-100 shadow-sm transition-colors hover:bg-white relative group">
              <button className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 hidden group-hover:block">
                <MoreVertical className="w-4 h-4" />
              </button>
              
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                  +{bonus.points} pt
                </Badge>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] hover:bg-orange-200">
                  {bonus.tag}
                </Badge>
                <span className="text-[10px] text-gray-400 ml-auto">
                  {formatDistanceToNow(bonus.createdAt, { addSuffix: true, locale: ja })}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {bonus.message}
              </p>

              <div className="mt-3 flex items-center gap-4 text-gray-400">
                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-red-500 transition-colors">
                  <MessageSquareHeart className="w-4 h-4" />
                  {bonus.reactions}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-primary transition-colors">
                  <Reply className="w-4 h-4" />
                  返信
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {filteredFeed.length === 0 && (
        <div className="py-20 text-center text-gray-400 text-sm">
          該当するバッジが見つかりません。
        </div>
      )}
    </div>
  )
}
