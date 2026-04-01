'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence,PanInfo } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Target, CheckCircle2, XIcon } from 'lucide-react'

// 仮の目標データ
const MOCK_GOALS = [
  { id: '1', title: '介護記録の17:30前入力完了', currentValue: 70, targetValue: 100, unit: '%' },
  { id: '2', title: '月間ヒヤリハット報告3件', currentValue: 1, targetValue: 3, unit: '件' },
  { id: '3', title: '移乗介助のOJTチェックリスト全項目クリア', currentValue: 5, targetValue: 10, unit: '項目' },
]

export default function GoalsPage() {
  const [goals] = useState(MOCK_GOALS)
  const [currentIndex, setCurrentIndex] = useState(0)

  // 目標が全て終わった場合の表示
  if (currentIndex >= goals.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-green-100 p-6 rounded-full text-green-500"
        >
          <CheckCircle2 className="w-16 h-16" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">今週の目標更新完了！</h2>
        <p className="text-gray-500 text-sm">進捗のアップデートありがとうございます。<br />素晴らしいペースです！</p>
      </div>
    )
  }

  const currentGoal = goals[currentIndex]

  // スワイプ終了時のハンドラ
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset > 100 || velocity > 500) {
      // 右スワイプ: 達成・進捗あり
      handleSwipeRight()
    } else if (offset < -100 || velocity < -500) {
      // 左スワイプ: 継続中・進捗なし
      handleSwipeLeft()
    }
  }

  const handleSwipeRight = () => {
    // API等で進捗更新処理を行う想定
    console.log(`Goal Achieved or Progressed: ${currentGoal.title}`)
    setTimeout(() => setCurrentIndex((prev) => prev + 1), 200)
  }

  const handleSwipeLeft = () => {
    // API等でステータス維持処理を行う想定
    console.log(`Goal Continued: ${currentGoal.title}`)
    setTimeout(() => setCurrentIndex((prev) => prev + 1), 200)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> 目標進捗チェック
          </h1>
          <p className="text-sm text-gray-500 mt-1">スワイプで今週の進捗を報告しましょう</p>
        </div>
        <div className="text-sm font-medium text-gray-400">
          {currentIndex + 1} / {goals.length}
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center mt-10">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentGoal.id}
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
            className="absolute w-full max-w-sm cursor-grab"
            style={{ x: 0 }}
          >
            <Card className="h-[400px] border border-gray-200 shadow-xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm">
              <CardContent className="h-full flex flex-col p-8 select-none">
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Target className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 leading-snug">
                    {currentGoal.title}
                  </h3>
                  
                  <div className="w-full bg-gray-100 rounded-full h-4 mt-8 overflow-hidden relative">
                    <div 
                      className="bg-primary h-full rounded-full absolute left-0 top-0 transition-all duration-1000"
                      style={{ width: `${(currentGoal.currentValue / currentGoal.targetValue) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between w-full text-xs text-gray-500 font-medium">
                    <span>現在 {currentGoal.currentValue} {currentGoal.unit}</span>
                    <span>目標 {currentGoal.targetValue} {currentGoal.unit}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-auto pt-6 px-2">
                  <button 
                    onClick={handleSwipeLeft}
                    className="flex flex-col items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center bg-white shadow-sm">
                      <XIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold">継続中/未到達</span>
                  </button>
                  <button 
                    onClick={handleSwipeRight}
                    className="flex flex-col items-center gap-2 text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center bg-white shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold">達成！</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-4">
        <span>← 左スワイプで継続</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
        <span>右スワイプで達成 →</span>
      </div>
    </div>
  )
}
