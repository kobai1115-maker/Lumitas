'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Target, Award, Sparkles, Mic, LogOut, CheckSquare, MessageSquare, Building2, Users, BookOpen } from 'lucide-react'
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
    supabase.auth.getSession().then(() => {
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
    { name: 'ホーム',       href: '/',           icon: Home },
    { name: '目標',         href: '/goals',       icon: Target },
    { name: 'AI評価',       href: '/evaluation',  icon: Mic },
    { name: 'ピアボーナス', href: '/peer-bonus',  icon: Award },
    { name: 'インシデント', href: '/incident',    icon: CheckSquare },
  ]

  // その他メニュー（サブナビ）
  const subNavItems = [
    { name: '1on1面談', href: '/one-on-one',  icon: MessageSquare },
    { name: '研修記録', href: '/training',    icon: BookOpen },
    { name: '組織目標', href: '/org-goals',   icon: Building2 },
    { name: 'スタッフ管理', href: '/admin/staff', icon: Users },
  ]

  if (!isReady) {
    return null // 画面のチラつきとHydrationエラーを防ぐため、準備ができるまで何も出さない
  }

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row pb-[env(safe-area-inset-bottom)]">
      {/* --- デスクトップ専用: 左サイドバー --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-50">
        <div className="flex flex-col h-full">
          {/* ロゴエリア */}
          <div className="p-6 border-b border-gray-100 mb-2">
            <Link href="/" className="flex items-center gap-2.5 text-primary font-black text-xl tracking-tighter hover:opacity-80 transition-opacity">
              <Sparkles className="w-6 h-6" />
              ルミタス <span className="text-[10px] bg-primary/5 px-1.5 py-0.5 rounded-md font-bold tracking-normal align-middle ml-1">v2</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 custom-scrollbar">
            {/* メインメニュー */}
            <nav className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">メインメニュー</p>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                    )}
                  >
                    <Icon className={clsx("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2 group-hover:scale-110 transition-transform")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* サブメニュー */}
            <nav className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">運営・管理設定</p>
              {subNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                    )}
                  >
                    <Icon className={clsx("w-4 h-4", isActive ? "stroke-[2.5px]" : "stroke-2 group-hover:scale-110 transition-transform")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* サイドバー下部（ログアウト） */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              ログアウト
            </button>
            <div className="mt-4 pt-4 border-t border-gray-100/50 flex justify-center">
              <p className="text-[8px] text-gray-300 font-medium tracking-[.25em]">© 2026 AXLINK</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- メインコンテンツ・ヘッダーエリア --- */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* モバイル用ヘッダー (スマホ画面でのみ表示) */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-white/80 backdrop-blur border-b px-4 py-3 h-14">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
            <Sparkles className="w-5 h-5" /> ルミタス (Lumitas)
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* コンテンツ本体 */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10 pb-24 overflow-x-hidden">
          {children}
          
          {/* PC向けフッター（PC表示のみ、サイドバー以外の下部にも配置） */}
          <footer className="hidden md:flex mt-12 py-8 border-t border-gray-100 justify-center">
            <p className="text-[10px] text-gray-400 font-medium tracking-[0.3em]">© 2026 AXLINK DEVELOPED BY AXLINK</p>
          </footer>
        </main>
      </div>

      {/* --- モバイル専用: ボトムナビゲーション (スマホ画面でのみ表示) --- */}
      <nav className="md:hidden fixed bottom-1.5 left-2 right-2 flex items-center justify-around h-16 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl z-40 px-2 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-300 rounded-xl relative",
                isActive ? "text-primary bg-primary/5" : "text-gray-400"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className="text-[9px] font-bold leading-none">{item.name}</span>
              {isActive && (
                <motion.span 
                  layoutId="active-pill"
                  className="absolute -bottom-1 w-5 h-1 bg-primary rounded-full"
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
