'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function MfaVerificationPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // ページ表示時にコードを自動送信
  useEffect(() => {
    sendCode()
  }, [])

  const sendCode = async () => {
    setIsResending(true)
    try {
      const res = await fetch('/api/auth/mfa/send', { method: 'POST' })
      if (res.ok) {
        toast.success('認証コードをメールで送信しました。')
      } else {
        toast.error('コードの送信に失敗しました。')
      }
    } catch (error) {
      toast.error('エラーが発生しました。')
    } finally {
      setIsResending(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error('6桁のコードを入力してください。')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (res.ok) {
        toast.success('認証に成功しました！')
        router.push('/dashboard')
      } else {
        const data = await res.json()
        toast.error(data.error || '認証コードが正しくありません。')
      }
    } catch (error) {
      toast.error('通信エラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">2段階認証</CardTitle>
            <CardDescription>
              管理者アカウント保護のため、登録メールアドレスに送信された6桁の認証コードを入力してください。
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Input
                  type="text"
                  placeholder="000000"
                  className="text-center text-3xl tracking-[1em] font-mono h-16"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={sendCode}
                disabled={isResending}
                className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                コードを再送する
              </button>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || code.length !== 6}>
                {isLoading ? '検証中...' : (
                  <>
                    認証してログイン <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
