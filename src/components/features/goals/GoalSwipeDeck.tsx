'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { CheckCircle2, XCircle, Target, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { Goal } from '@/app/(dashboard)/goals/page'
import { cn } from '@/lib/utils'

type Props = {
  goals: Goal[]
  onSwipeRight: (goal: Goal) => void
  onSwipeLeft: (goal: Goal) => void
  onComplete: () => void
}

export default function GoalSwipeDeck({ goals, onSwipeRight, onSwipeLeft, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleSwipe = (direction: 'right' | 'left') => {
    const goal = goals[currentIndex]
    if (direction === 'right') {
      onSwipeRight(goal)
    } else {
      onSwipeLeft(goal)
    }

    if (currentIndex < goals.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      onComplete()
    }
  }

  if (goals.length === 0 || currentIndex >= goals.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm rounded-[32px] border border-dashed border-gray-200 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-black text-gray-800">すべての目標をチェックしました！</h3>
        <p className="text-xs text-gray-500 font-bold mt-1">今日も一歩、成長に近づきましたね。</p>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[400px] flex items-center justify-center perspective-1000">
      <AnimatePresence mode="popLayout">
        {goals.slice(currentIndex, currentIndex + 2).reverse().map((goal, index) => {
          const isTop = index === (goals.slice(currentIndex, currentIndex + 2).length - 1)
          return (
            <SwipeCard 
              key={goal.id}
              goal={goal}
              isTop={isTop}
              onSwipe={handleSwipe}
            />
          )
        })}
      </AnimatePresence>

      {/* 指示ガイド */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-between px-8">
        <div className="flex flex-col items-center gap-1 opacity-40">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-tighter">継続</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <ArrowRight className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-tighter text-green-600">達成！</span>
        </div>
      </div>
    </div>
  )
}

function SwipeCard({ goal, isTop, onSwipe }: { goal: Goal, isTop: boolean, onSwipe: (dir: 'right' | 'left') => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5])
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8])
  
  const rightOpacity = useTransform(x, [50, 150], [0, 1])
  const leftOpacity = useTransform(x, [-150, -50], [1, 0])

  return (
    <motion.div
      style={{ x, rotate, opacity, scale, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipe('right')
        else if (info.offset.x < -100) onSwipe('left')
      }}
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: 1, y: isTop ? 0 : 10 }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, transition: { duration: 0.3 } }}
      className={cn(
        "absolute inset-0 bg-white rounded-[32px] shadow-2xl border border-gray-100 p-8 flex flex-col cursor-grab active:cursor-grabbing select-none",
        !isTop && "pointer-events-none"
      )}
    >
      {/* Swipe Overlays */}
      <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 bg-green-500/10 rounded-[32px] flex items-center justify-center pointer-events-none border-4 border-green-500/50">
        <div className="bg-white p-4 rounded-full shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
      </motion.div>
      <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 bg-gray-500/10 rounded-[32px] flex items-center justify-center pointer-events-none border-4 border-gray-500/50">
        <div className="bg-white p-4 rounded-full shadow-lg">
          <XCircle className="w-12 h-12 text-gray-500" />
        </div>
      </motion.div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <Target className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-black px-3 py-1 bg-gray-100 text-gray-500 rounded-full tracking-widest uppercase">
          {goal.type === 'DAILY' ? 'DAILY' : goal.type}
        </span>
      </div>

      <h3 className="text-xl font-black text-gray-800 leading-tight mb-4">
        {goal.title}
      </h3>

      {goal.aiAlignmentNote && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase">AI Advice</span>
          </div>
          <p className="text-xs text-gray-600 font-bold leading-relaxed line-clamp-3">
            {goal.aiAlignmentNote}
          </p>
        </div>
      )}

      <div className="mt-auto">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">現在の進捗</span>
          <span className="text-lg font-black text-primary">{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }} 
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
          <span>{goal.currentValue} {goal.unit}</span>
          <span>{goal.targetValue} {goal.unit}</span>
        </div>
      </div>
    </motion.div>
  )
}
