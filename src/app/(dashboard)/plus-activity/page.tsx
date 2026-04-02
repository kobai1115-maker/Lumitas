'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Palmtree, 
  Camera, 
  Plus, 
  Award, 
  CloudSun, 
  Dumbbell, 
  MapPin, 
  FlameKindling,
  Loader2,
  CheckCircle2,
  Trophy
} from 'lucide-react'
import { clsx } from 'clsx'

type ActivityCategory = 'HEALTH' | 'HOBBY' | 'COMMUNITY'

type ActivityLog = {
  id: string
  category: ActivityCategory
  title: string
  content: string
  points: number
  date: string
  imageUrl?: string
}

const CATEGORIES = [
  { id: 'HEALTH', label: '健康・筋トレ', icon: Dumbbell, color: 'text-orange-500 bg-orange-50', description: 'ウォーキング、筋トレ、ジム、禁煙など' },
  { id: 'HOBBY', label: '趣味・学び', icon: Palmtree, color: 'text-blue-500 bg-blue-50', description: '趣味、資格勉強、読書など' },
  { id: 'COMMUNITY', label: '地域・ボランティア', icon: MapPin, color: 'text-emerald-500 bg-emerald-50', description: '町内会、ボランティア活動など' },
]

const MOCK_HISTORY: ActivityLog[] = [
  { id: '1', category: 'HEALTH', title: '週3回のジム通い継続中', content: 'ベンチプレスがついに目標の60kgに届きました！体力もついて、移乗介助が楽になった気がします。', points: 15, date: '2026/03/30' },
  { id: '2', category: 'COMMUNITY', title: '日曜日の地域清掃ボランティア', content: '早朝から近隣公園の清掃に参加しました。近隣住民の方々とコミュニケーションが取れました。', points: 20, date: '2026/03/28' },
  { id: '3', category: 'HOBBY', title: 'アロマテラピー検定の勉強開始', content: '利用者様の入浴ケア時のリラックス効果を狙い、専門知識の習得を開始しました。', points: 10, date: '2026/03/25' },
]

export default function PlusActivityPage() {
  const [activeTab, setActiveTab] = useState<ActivityCategory>('HEALTH')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // フォーム用
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // シミュレート
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
      setTitle('')
      setContent('')
      setImagePreview(null)
      
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1500)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-8">
      {/* ヒーローヘッダー */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary/20 text-primary-foreground text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-primary/30 uppercase">
                Life Enrichment / 豊かな生活
              </span>
            </div>
            <h1 className="text-4xl font-black mb-3 leading-none">
              プラス活動記録
            </h1>
            <p className="text-gray-400 font-bold max-w-md leading-relaxed text-sm">
              仕事以外の「頑張り」や「充実」も、あなたの力になります。
              健康や趣味の活動を記録して、ルミタスポイントを獲得しましょう。
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center min-w-[200px]">
             <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">現在の累計獲得ポイント</p>
             <p className="text-4xl font-black text-primary">1,250 <span className="text-sm">pt</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 入力フォームエリア */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-gray-100 overflow-hidden bg-white">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">新しい記録を追加</h2>
              <Award className="w-6 h-6 text-primary animate-bounce" />
            </div>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* カテゴリ選択 */}
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    const isActive = activeTab === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveTab(cat.id as ActivityCategory)}
                        className={clsx(
                          "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all duration-300 border-2",
                          isActive 
                            ? clsx("scale-105 shadow-lg", cat.color.replace('50', '200'), "border-primary")
                            : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"
                        )}
                      >
                        <Icon className={clsx("w-6 h-6", isActive ? "text-primary" : "text-gray-300")} />
                        <span className="text-[10px] font-black">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">活動タイトル</label>
                    <input 
                      type="text"
                      required
                      placeholder="例: ベンチプレス60kg達成！"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl h-14 px-5 font-bold focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 placeholder:text-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">活動内容・エピソード</label>
                    <textarea 
                      required
                      placeholder="具体的な成果や、楽しかったこと、現場で活かせそうなこと..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-[1.5rem] p-5 font-bold focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 min-h-[120px] resize-none placeholder:text-gray-300"
                    />
                  </div>

                  {/* 画像添付 */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">画像を追加 (任意)</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => document.getElementById('activity-photo')?.click()}
                        className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors shrink-0 overflow-hidden group"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <>
                            <Camera className="w-6 h-6 text-gray-200 group-hover:text-primary transition-colors" />
                            <span className="text-[10px] font-bold text-gray-300 mt-1">写真を添付</span>
                          </>
                        )}
                      </button>
                      <input 
                        id="activity-photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      {imagePreview && (
                         <Button variant="ghost" size="sm" onClick={() => setImagePreview(null)} className="text-rose-500 font-bold">削除</Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full rounded-2xl h-14 font-black text-lg shadow-2xl shadow-primary/30 relative overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" /> 送信中...
                        </motion.div>
                      ) : showSuccess ? (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" /> 送信完了！
                        </motion.div>
                      ) : (
                        <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <Plus className="w-5 h-5" /> プラス活動を記録する
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                  <p className="text-center text-[11px] font-bold text-gray-400 mt-4">
                    ※投稿後、自動的にポイントが加算されます
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* タイムラインエリア */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
           <div className="flex items-center justify-between px-4">
             <h3 className="text-xl font-black text-gray-900">あなたの軌道 / Activity Timeline</h3>
             <Button variant="ghost" className="text-primary font-black text-xs rounded-xl">すべて見る</Button>
           </div>

           <div className="grid gap-6">
             {MOCK_HISTORY.map((log, idx) => {
               const catInfo = CATEGORIES.find(c => c.id === log.category)
               const Icon = catInfo?.icon || Award
               return (
                 <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={log.id}
                 >
                   <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white/60 backdrop-blur group">
                     <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                        <div className={clsx(
                          "w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-transform",
                          catInfo?.color || "bg-gray-100"
                        )}>
                          <Icon className={clsx("w-8 h-8", catInfo?.color.replace('bg-', 'text-'))} />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <span className={clsx("text-[9px] font-black px-2 py-0.5 rounded-full uppercase", catInfo?.color.replace('50', '200'))}>
                                    {catInfo?.label}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-300">{log.date}</span>
                               </div>
                               <h4 className="text-lg font-black text-gray-800 leading-tight group-hover:text-primary transition-colors">{log.title}</h4>
                            </div>
                            <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 text-center shrink-0">
                               <p className="text-[10px] font-black text-primary opacity-50 uppercase leading-none mb-1">獲得！</p>
                               <p className="text-lg font-black text-primary leading-none">+{log.points}pt</p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-500 leading-relaxed italic">
                            "{log.content}"
                          </p>
                        </div>
                     </CardContent>
                   </Card>
                 </motion.div>
               )
             })}
           </div>

           {/* 応援メッセージ */}
           <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-500/20">
              <CloudSun className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-20 rotate-12" />
              <div className="relative">
                <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                  <FlameKindling className="w-5 h-5 text-yellow-300" />
                  今日もあなたの「得意」をプラスに
                </h4>
                <p className="text-sm font-bold text-white/80 max-w-lg leading-relaxed">
                  プライベートの充実は、より良いケアの源泉です。
                  どんな小さなことでも構いません。あなたが「やってよかった」と思えることを、
                  ルミタスは全力で応援します。
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
