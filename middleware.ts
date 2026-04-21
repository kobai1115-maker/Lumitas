// @ts-ignore
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Middleware
 * サーバーサイドとクライアントサイドのセッション情報を Cookie 経由で同期します。
 * これにより /api/auth/me などの API ルートでセッションを正しく取得できるようになります。
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. 静的ファイルや特定の公開パスは早期リターン（高速化）
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.includes('.') // 画像、フォント、ファビコンなど
  ) {
    return NextResponse.next()
  }

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // 2. クッキーの存在確認（無駄なネットワークリクエストを防止）
  const hasSession = req.cookies.getAll().some(cookie => cookie.name.includes('supabase-auth-token'))
  
  // 開発者用バイパス
  const isDev = req.cookies.get('axlink_dev_session')?.value === 'DEVELOPER'

  if (!hasSession && !isDev) {
    return res
  }

  // 3. セッションの同期
  // @ts-ignore
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  await supabase.auth.getSession()

  return res
}

// 静的ファイルやAPIの一部を除外するマッチャー設定
export const config = {
  matcher: [
    /*
     * 次のパスを除くすべてのリクエストパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico (ファビコン)
     * - 画像ファイル (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
