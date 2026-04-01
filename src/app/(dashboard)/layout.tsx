'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Target, Award, ALargeSmall, Mic, LogOut, CheckSquare } from 'lucide-react'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)

  // 簡易的なセッション・リダイレクト処理（実運用ではMiddleware推奨）
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // ログアウトなどの動作確認時はコメントアウトするか適切に開発用設定をしてください。
      // if (!session) {
      //   router.push('/login')
      // } else {
        setIsReady(true)
      // }
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ボトムナビゲーションの定義 (モバイルファースト)
  const navItems = [
    { name: 'ホーム', href: '/', icon: Home },
    { name: '目標・MBO', href: '/goals', icon: Target },
    { name: '評価(音声)', href: '/evaluation', icon: Mic },
    { name: 'ピアボーナス', href: '/peer-bonus', icon: Award },
    { name: 'インシデント', href: '/incident', icon: CheckSquare },
  ]

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-[env(safe-area-inset-bottom)]">
      {/* 画面上部ヘッダー (モバイル用) */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm h-14">
        <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
          <ALargeSmall className="w-5 h-5" /> CareGrow AI
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
          title="ログアウト"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* メインコンテンツ領域 (モバイルではpb-16で下のナビゲーションとの被りを防ぐ） */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:pb-8 pb-24 overflow-x-hidden">
        {children}
      </main>

      {/* ボトムナビゲーション (全デバイス共通で表示して操作を確認しやすくする) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 max-w-3xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                  isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 md:w-16 h-1 bg-primary rounded-b-md" />
                )}
                <Icon className={clsx("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                <span className="text-[10px] md:text-xs font-medium leading-none">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      
      {/* PC表示用のサイドバー（今回はモバイルファーストなので省略気味ですが、拡張可能） */}
    </div>
  )
}
