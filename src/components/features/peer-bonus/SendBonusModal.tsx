'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Send, CheckCircle2 } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const COMMON_TAGS = ['#神対応', '#チームワーク', '#迅速な対応', '#気配り', '#知識共有']

// 紙吹雪エフェクト (Framer Motion)
function Confetti() {
  // Purityルール遵守のため、ランダム値はクライアントサイドでのマウント後に一度だけ生成する
  const [particles, setParticles] = React.useState<any[]>([])

  React.useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      color: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
      scale: Math.random() + 0.5,
      x: (Math.random() - 0.5) * window.innerWidth * 0.8,
      y: (Math.random() - 0.5) * window.innerHeight * 0.8 + 200,
      rotate: Math.random() * 360,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: p.color }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, p.scale, 0],
            x: p.x,
            y: p.y,
            rotate: p.rotate,
          }}
          transition={{ duration: 2, ease: "easeOut" }}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // API送信のモック
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSuccess(true)

    // 紙吹雪アニメーションを見せた後、2秒後にモーダルを閉じる
    setTimeout(() => {
      setIsSuccess(false)
      setReceiverName('')
      setTag('')
      setMessage('')
      onClose()
    }, 2500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isSuccess && <Confetti />}
      </AnimatePresence>

      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            サンクスバッジを送る
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1">
            日頃の感謝や優れた行動を称えるメッセージを送りましょう。(5pt付与されます)
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">送信完了！</h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  あなたの感謝の気持ちが伝わりました。相手のモチベーションアップに貢献しました！
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="py-4 space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="receiver" className="text-xs font-bold text-gray-500 flex items-center justify-between">
                    送る相手
                    <span className="text-red-400 font-normal text-[10px]">* 必須</span>
                  </Label>
                  <Input 
                    id="receiver"
                    placeholder="名前を入力（例: 山田太郎）"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    required
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag" className="text-xs font-bold text-gray-500 flex items-center justify-between">
                    バッジ（タグ選択）
                    <span className="text-red-400 font-normal text-[10px]">* 必須</span>
                  </Label>
                  <Input 
                    id="tag"
                    placeholder="#神対応 や #チームワーク など"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    required
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {COMMON_TAGS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTag(t)}
                        className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
                          tag === t 
                            ? 'bg-primary text-white font-bold shadow-sm' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 font-medium'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-bold text-gray-500 flex items-center justify-between">
                    感謝のメッセージ
                    <span className="text-red-400 font-normal text-[10px]">* 必須</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="具体的な行動エピソードを添えると喜ばれます..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    maxLength={200}
                    className="resize-none h-24 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-sm"
                  />
                  <div className="text-right text-[10px] text-gray-400 font-medium mt-1">
                    {message.length} / 200
                  </div>
                </div>
                
                <DialogFooter className="mt-8 pt-4 border-t border-gray-100 sm:justify-between items-center hidden sm:flex">
                  <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:bg-gray-100">
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="font-bold shadow-sm hover:shadow-md transition-all group">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">送信中...</span>
                    ) : (
                      <span className="flex items-center gap-2 text-white">
                        <Send className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /> 送信（5pt付与）
                      </span>
                    )}
                  </Button>
                </DialogFooter>
                
                {/* モバイル用フッター */}
                <div className="mt-6 sm:hidden flex flex-col gap-2">
                  <Button type="submit" disabled={isSubmitting} size="lg" className="w-full font-bold shadow-sm group">
                    {isSubmitting ? '送信中...' : '送信（5pt付与）'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="w-full text-gray-500">
                    キャンセル
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
