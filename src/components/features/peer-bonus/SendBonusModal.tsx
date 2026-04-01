'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Heart, Send, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const COMMON_TAGS = [
  { label: '#神対応', icon: '✨', color: 'bg-yellow-100 text-yellow-700' },
  { label: '#チームワーク', icon: '🤝', color: 'bg-blue-100 text-blue-700' },
  { label: '#迅速な対応', icon: '⚡', color: 'bg-orange-100 text-orange-700' },
  { label: '#気配り', icon: '🍵', color: 'bg-pink-100 text-pink-700' },
  { label: '#知識共有', icon: '💡', color: 'bg-emerald-100 text-emerald-700' }
]

// 紙吹雪エフェクト (Framer Motion)
function Confetti() {
  type Particle = { id: number; color: string; scale: number; x: number; y: number; rotate: number; }
  const [particles, setParticles] = React.useState<Particle[]>([])

  React.useEffect(() => {
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      color: ['#ffc0cb', '#ff69b4', '#ffd700', '#00ced1', '#adff2f', '#ff4500'][Math.floor(Math.random() * 6)],
      scale: Math.random() * 1.5 + 0.5,
      x: (Math.random() - 0.5) * window.innerWidth * 0.9,
      y: (Math.random() - 0.5) * window.innerHeight * 0.9 + 200,
      rotate: Math.random() * 720,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, p.scale, 0],
            x: p.x,
            y: p.y,
            rotate: p.rotate,
          }}
          transition={{ duration: 3, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

export default function SendBonusModal({ isOpen, onClose }: Props) {
  const [receiverName, setReceiverName] = useState('')
  const [tag, setTag] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const selectedTagInfo = COMMON_TAGS.find(t => t.label === tag)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setIsSuccess(true)

    setTimeout(() => {
      setIsSuccess(false)
      setReceiverName('')
      setTag('')
      setMessage('')
      onClose()
    }, 3500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isSuccess && <Confetti />}
      </AnimatePresence>

      <DialogContent className="sm:max-w-xl overflow-hidden rounded-3xl border-none p-0 bg-white/95 backdrop-blur-xl shadow-2xl">
        {/* デザインヘッダー（華やかなグラデーション） */}
        <div className="bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 h-32 relative overflow-hidden flex items-center justify-center px-6">
          <motion.div 
            animate={{ 
              background: ["radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)", "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)"],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 opacity-30" 
          />
          <div className="relative text-white text-center">
            <DialogTitle className="text-2xl font-black tracking-tighter flex items-center justify-center gap-2 drop-shadow-md">
              <Heart className="w-7 h-7 fill-white animate-pulse" />
              感謝の気持ちを送る
            </DialogTitle>
            <DialogDescription className="text-white/80 text-xs font-bold mt-1 tracking-widest uppercase">
              Spread Happiness & Points
            </DialogDescription>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="relative mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
                    className="bg-gradient-to-br from-green-400 to-emerald-600 p-6 rounded-full shadow-lg shadow-emerald-200"
                  >
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-emerald-400 -z-10 blur-xl"
                  />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">送信しました！</h3>
                <p className="text-gray-500 font-medium max-w-xs leading-relaxed text-sm">
                  あなたの温かい言葉が届きました。<br />
                  <span className="text-primary font-bold">5pt</span> が贈られ、チームの絆が深まりました。
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* プレビューカード（華やかな演出） */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-200 group relative">
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-400 tracking-widest uppercase">
                    Message Card Preview
                  </span>
                  <div className="bg-white rounded-xl shadow-xl p-4 border border-gray-100 min-h-[140px] flex flex-col justify-between transition-all duration-500 hover:rotate-1 hover:scale-[1.02]">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-black text-primary leading-none">
                          To: <span className="text-gray-800 underline decoration-primary/30 underline-offset-4">{receiverName || '○○さん'}</span>
                        </div>
                        {selectedTagInfo && (
                          <Badge className={`${selectedTagInfo.color} border-none shadow-sm animate-bounce`}>
                            {selectedTagInfo.icon} {selectedTagInfo.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-3 italic leading-relaxed">
                        {message || 'いつもありがとうございます！ここにメッセージの内容が表示されます。'}
                      </p>
                    </div>
                    <div className="flex justify-end pt-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiver" className="text-[11px] font-black text-gray-400 uppercase tracking-wider">送る相手</Label>
                    <Input 
                      id="receiver"
                      placeholder="名前を入力"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      required
                      className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-rose-500/20 text-sm h-11"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">バッジを選択</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_TAGS.map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setTag(t.label)}
                          className={clsx(
                            "text-[10px] px-3 py-1.5 rounded-full transition-all duration-300 font-black",
                            tag === t.label 
                              ? `${t.color} scale-105 shadow-md ring-2 ring-primary/20` 
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          )}
                        >
                          {t.icon} {t.label.replace('#', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[11px] font-black text-gray-400 uppercase tracking-wider">メッセージ</Label>
                  <Textarea
                    id="message"
                    placeholder="具体的な感謝の出来事を送りましょう..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    maxLength={140}
                    className="resize-none h-24 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-rose-500/20 text-sm leading-relaxed"
                  />
                  <div className="text-right text-[10px] font-bold text-gray-300">
                    {message.length} / 140 文字
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-50 flex gap-3">
                  <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl text-gray-400 hover:text-gray-600">
                    閉じる
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !receiverName || !tag || !message} 
                    className="flex-[2] rounded-xl h-12 font-black text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-90 shadow-lg shadow-indigo-200 transition-all active:scale-95 group"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin mr-1" /> 送信中...</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                        ありがとうを贈る（5pt）
                      </span>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
