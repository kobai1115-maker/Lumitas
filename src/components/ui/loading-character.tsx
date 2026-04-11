'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * LoadingCharacter: 
 * 「お助けスタッフ」がトコトコ歩くアニメーションコンポーネント。
 * 作図のバランスを整え、パーツが分離しないように再構築。
 */
export const LoadingCharacter = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-8"
    >
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* 背景の柔らかな光 */}
        <motion.div
          className="absolute inset-0 bg-yellow-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* キャラクター本体 (SVG) */}
        <motion.svg
          width="140"
          height="160"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            y: [0, -8, 0], // 跳ねるような動き
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* 足 (体との接続を重視) */}
          <motion.rect
            x="32" y="85" width="14" height="22" rx="7" fill="#546E7A"
            animate={{
              y: [0, -12, 0],
              x: [32, 28, 32],
              rotate: [0, -15, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "39px", originY: "85px" }}
          />
          <motion.rect
            x="54" y="85" width="14" height="22" rx="7" fill="#546E7A"
            animate={{
              y: [0, -12, 0],
              x: [54, 58, 54],
              rotate: [0, 15, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
            style={{ originX: "61px", originY: "85px" }}
          />

          {/* 体 (丸みのある制服) */}
          <rect x="25" y="45" width="50" height="52" rx="20" fill="#FBC02D" />
          
          {/* 腕 (肩の位置から自然に生やす) */}
          <motion.rect
            x="14" y="52" width="12" height="28" rx="6" fill="#FBC02D"
            animate={{ rotate: [20, -20, 20] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "20px", originY: "55px" }}
          />
          <motion.rect
            x="74" y="52" width="12" height="28" rx="6" fill="#FBC02D"
            animate={{ rotate: [-20, 20, -20] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "80px", originY: "55px" }}
          />

          {/* 頭 (大きめで親しみやすく) */}
          <circle cx="50" cy="32" r="24" fill="#FFE0B2" />
          
          {/* 髪 (少しアクセント) */}
          <path d="M28 25C28 25 35 12 50 12C65 12 72 25 72 25" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />

          {/* 顔のパーツ */}
          <circle cx="40" cy="32" r="2.5" fill="#263238" />
          <circle cx="60" cy="32" r="2.5" fill="#263238" />
          <motion.path 
            d="M42 42C42 42 46 46 50 46C54 46 58 42 58 42" 
            stroke="#263238" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            animate={{ scaleY: [1, 1.4, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          
          {/* ハートのバッジ (拡大) */}
          <path d="M50 70C50 70 48 66 44 66C40 66 38 69 38 72C38 77 50 82 50 82C50 82 62 77 62 72C62 69 60 66 56 66C52 66 50 70 50 70Z" fill="#FF4081" />
        </motion.svg>

        {/* 接地感のための影 */}
        <motion.div
          className="absolute bottom-4 w-24 h-3 bg-black/10 rounded-full blur-[2px]"
          animate={{
            scale: [0.7, 1.1, 0.7],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <h3 className="text-2xl font-black text-amber-500 tracking-[0.3em] italic">
            読み込み中...
          </h3>
          <motion.div 
            className="absolute -right-10 -top-2 text-amber-400"
            animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ✨
          </motion.div>
        </div>
        
        <div className="w-56 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs text-gray-400 font-extrabold tracking-widest opacity-80">
          スタッフが準備しています
        </p>
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest -mt-2">
          少々お待ちください
        </p>
      </div>
    </motion.div>
  )
}
