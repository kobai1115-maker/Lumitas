'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Loader2, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VoiceInputFab() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultText, setResultText] = useState('')
  const [resultCategory, setResultCategory] = useState('')
  
  // 実際にはWeb Speech API等で音声を拾うが、今回はモックとしてタイマー処理
  // 実際にはWeb Speech API等で音声を拾うが、今回はモックとしてタイマー処理

  const handleToggleRecord = async () => {
    if (isRecording) {
      // 録音停止＆処理開始
      setIsRecording(false)
      setIsProcessing(true)
      
      try {
        // 仮の録音テキスト (実際はSpeech-to-Text API等の結果)
        const mockVoiceText = 'えーと、今日午前中にAさんが転倒しそうになったとき、すぐに駆け寄って支えたので怪我はありませんでした。ヒヤリハットの報告書ももう出してます。'
        
        // API呼び出し (Geminiで客観的な評価文に変換)
        const res = await fetch('/api/ai/voice-to-eval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: mockVoiceText })
        })

        const data = await res.json()
        
        if (data.structuredText) {
          setResultText(data.structuredText)
          setResultCategory(data.category)
        }
      } catch (e) {
        console.error(e)
        setResultText('ネットワークエラーが発生しました。再試行してください。')
      } finally {
        setIsProcessing(false)
      }
    } else {
      // 録音開始
      setIsRecording(true)
      setResultText('')
      setResultCategory('')
    }
  }

  return (
    <>
      {/* 画面下部中央にフローティングするマイクボタン */}
      <div className="fixed bottom-24 md:bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-4 bg-gray-900/90 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest flex items-center gap-2 shadow-xl backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              録音中... (タップで完了)
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 bg-primary text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              AIが客観化中...
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleRecord}
          disabled={isProcessing}
          className={`
            relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300
            ${isRecording 
              ? 'bg-white border-2 border-red-500 text-red-500' 
              : 'bg-primary border-none text-white hover:bg-primary/90'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {/* 波紋エフェクト */}
          {isRecording && (
            <span className="absolute w-full h-full rounded-full bg-red-500/30 animate-ping" />
          )}

          {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-7 h-7" />}
        </motion.button>
      </div>

      {/* 結果表示モーダル（画面内要素として配置） */}
      <AnimatePresence>
        {resultText && !isRecording && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 bg-white p-5 rounded-2xl shadow-lg border border-primary/20 relative"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-gray-800 text-sm">AIによる行動記録化</h4>
              <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                {resultCategory}
              </span>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm leading-relaxed text-gray-700">
              <p>{resultText}</p>
            </div>
            
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setResultText('')}>
                再録音
              </Button>
              <Button className="flex-1 text-xs gap-1 shadow-sm font-bold">
                <Check className="w-4 h-4" /> 記録として保存
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
