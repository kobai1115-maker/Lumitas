'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Leaf, Lock, UserSquare2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorText('')

    try {
      // 1. 特別な「admin」アカウントのバイパス（開発時用）
      if (staffId === 'admin' && password === '12345678') {
        console.warn('Developer bypass: Logging in as admin')
        // セッションをローカルストレージやCookie等で「ログイン済み」に見せかける処理も可能ですが、
        // 今回はそのままダッシュボードへ遷移することを許可します。
        // （本来はsupabase.auth.signInでセッションを得る必要がありますが、デモ用に許可）
        router.push('/dashboard')
        return
      }

      // 職員IDを内部的なメールアドレス形式に変換（@が含まれていない場合のみ）
      const loginEmail = staffId.includes('@') ? staffId : `${staffId}@lumitas.local`

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (error) {
        throw error
      }

      if (data.session) {
        // ログイン成功時にダッシュボードへ遷移
        router.push('/dashboard')
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorText(error.message)
      } else {
        setErrorText('ログインに失敗しました。')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">ルミタス (Lumitas)</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">介護・医療・福祉事業所職員評価統合管理システム</p>
        </div>

        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>
              システムを利用するにはログインしてください。
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {errorText && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-100">
                  {errorText}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="staffId" className="flex items-center gap-2">
                  <UserSquare2 className="w-4 h-4 text-gray-500" />
                  職員ID
                </Label>
                <Input
                  id="staffId"
                  type="text"
                  placeholder="例: 1001"
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    パスワード
                  </Label>
                  <Link
                    href="/reset-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    お忘れですか？
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center text-gray-400 text-xs">
          © 2026 AXLINK
        </div>
      </motion.div>
    </div>
  )
}
