'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Target, Award, Sparkles, Mic, LogOut, CheckSquare, MessageSquare, Building2, Users, BookOpen, Settings2, Settings, ChevronDown, Heart, Network } from 'lucide-react'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/use-profile'
import { LoadingCharacter } from '@/components/ui/loading-character'

// --- トッププログレスバーコンポーネント ---
const TopProgressBar = ({ isNavigating }: { isNavigating: boolean }) => (
  <AnimatePresence>
    {isNavigating && (
      <motion.div
        initial={{ width: "0%", opacity: 0 }}
        animate={{ width: "100%", opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 z-[100] shadow-[0_0_10px_rgba(251,192,45,0.5)]"
      />
    )}
  </AnimatePresence>
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, loading, isSystemAdmin, isCorpAdmin, isFacilityManager, isStaff, refresh } = useProfile()
  const [isReady, setIsReady] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)

  // 画面遷移を検知してバーを出す
  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 800)
    return () => clearTimeout(timer)
  }, [pathname])

  // ページパスが変わった際にオーバーレイを解除（最低表示時間を守る）
  useEffect(() => {
    // 遷移が完了した際、最低限の表示時間を確保してフェードアウト
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [pathname])

  const handleLinkClick = (href: string) => {
    // 現在のページと同じなら何もしない
    if (pathname === href) return
    // クリックした瞬間にオーバーレイを表示
    setIsPageLoading(true)
  }

  // 認証ガード: ログインしていないユーザーをログイン画面へリダイレクト
  useEffect(() => {
    let mounted = true
    const checkAuth = async () => {
      try {
        // API（profile）を待つだけでなく、まずクライアント側のセッションを直接確認
        const { data: { session }, error } = await supabase.auth.getSession()

        // 認証エラー（Invalid Refresh Tokenなど）が発生した場合はログイン画面へ
        if (error) {
          console.error('Auth check error:', error)
          router.push('/login')
          return
        }
        
        if (!loading) {
          // セッションもプロフィールも無い場合にのみ、未ログインとして扱う
          if (!session && !profile) {
            router.push('/login')
          } else if (profile || session) {
            // セッションがあれば、プロフィール読み込み中であっても「準備完了」に近い状態とする
            setIsReady(true)
          }
        }
      } catch (e) {
        console.error('Auth unexpected error:', e)
        router.push('/login')
      }
    }
    
    // 認証状態の変化を監視（ログイン成功時などに再取得）
    // @ts-ignore
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      console.log('--- Auth Event ---', event)
      if (mounted) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          refresh()
        }
      }
    })
    
    checkAuth()
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loading, profile, router, refresh])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ボトムナビゲーションの定義 (モバイルファースト)
  const navItems = [
    { name: 'ホーム',       href: '/dashboard',           icon: Home },
    { name: '目標',         href: '/goals',       icon: Target },
    { name: 'AI評価',       href: '/evaluation',  icon: Mic },
    { name: 'サンクスバッジ', href: '/peer-bonus',  icon: Award },
    { name: 'グッドキャッチ', href: '/incident',    icon: CheckSquare },
  ]

  const subNavItems = [
    { name: '1on1面談', href: '/one-on-one',  icon: MessageSquare },
    { name: '研修記録', href: '/training',    icon: BookOpen },
    { name: 'プラス活動', href: '/plus-activity', icon: Heart },
    { name: '組織目標', href: '/org-goals',   icon: Building2 },
    { name: 'スタッフ管理', href: '/admin/staff', icon: Users, roles: ['SYSTEM_ADMIN', 'ADMIN', 'MANAGER'] },
    { name: '組織管理', href: '/admin/organization', icon: Network, roles: ['SYSTEM_ADMIN', 'ADMIN'] },
    { name: '職位・権限設定', href: '/admin/roles', icon: Settings2, roles: ['SYSTEM_ADMIN', 'ADMIN'] },
    { name: '施設・拠点設定', href: '/admin/settings', icon: Settings, roles: ['SYSTEM_ADMIN', 'ADMIN'] },
  ]

  const filteredSubNav = subNavItems.filter(item => {
    if (!('roles' in item)) return true // roles 定義がないものは全員
    const roles = (item as any).roles as string[]
    return roles.includes(profile?.role || '')
  })

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row pb-[env(safe-area-inset-bottom)] relative overflow-hidden">
      {/* 
        --- 即時オーバーレイ「シャッター遷移」レイヤー ---
        ここがクリック即座に反応する部分です。
      */}
      <AnimatePresence>
        {isPageLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-white/95 backdrop-blur-md"
          >
            <div className="transform -translate-y-12">
              <LoadingCharacter />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TopProgressBar isNavigating={isNavigating} />
      {/* 
         --- デスクトップ専用: 左サイドバー ---
         will-change-transform を追加してGPU支援を。
      */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-50 will-change-transform">
        <div className="flex flex-col h-full">
          {/* ロゴエリア */}
          <div className="p-6 border-b border-gray-100 mb-2">
            <Link 
              href="/dashboard" 
              onClick={() => handleLinkClick('/dashboard')}
              className="flex items-center gap-2.5 text-primary font-black text-xl tracking-tighter hover:opacity-80 transition-opacity"
            >
              <Sparkles className="w-6 h-6" />
              ルミタス <span className="text-[10px] bg-primary/5 px-1.5 py-0.5 rounded-md font-bold align-middle ml-1">第2版</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 custom-scrollbar">
            {/* メインメニュー */}
            <nav className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 px-3 mb-2 uppercase tracking-[0.2em]">メインメニュー</p>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => handleLinkClick(item.href)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150",
                      isActive
                        ? "bg-gray-900 text-white shadow-xl shadow-gray-200"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className={clsx("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* サブメニュー (権限に応じて表示) */}
            {filteredSubNav.length > 0 && (
              <nav className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 px-3 mb-2 uppercase tracking-[0.2em]">業務・管理メニュー</p>
                {filteredSubNav.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => handleLinkClick(item.href)}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className={clsx("w-4 h-4", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/30">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-white/90 backdrop-blur-md border-b px-4 py-3 h-14">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
            <Sparkles className="w-5 h-5" /> ルミタス (Lumitas)
          </Link>
          <button onClick={handleLogout} className="p-2 text-gray-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* 画面遷移アニメーションを簡略化 */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10 pb-24 overflow-x-hidden">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "linear" }}
          >
            {children}
          </motion.div>
          <p className="text-center text-[10px] text-gray-300 mt-12 pb-8 tracking-widest font-black uppercase">© 2026 ケアグロウ AI 評価システム</p>
        </main>
      </div>

      {/* モバイルボトムナビ: transition時間を短縮 */}
      <nav className="md:hidden fixed bottom-2 left-2 right-2 flex items-center justify-around h-16 bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl z-40 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => handleLinkClick(item.href)}
              className={clsx(
                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-200 relative",
                isActive ? "text-primary" : "text-gray-400"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "stroke-[2px]" : "stroke-2")} />
              <span className="text-[9px] font-bold">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
