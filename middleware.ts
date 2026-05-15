import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Middleware
 * サーバーサイドとクライアントサイドのセッション情報を Cookie 経由で同期します。
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  // 1. 静的ファイルや特定の公開パスは早期リターン（高速化）
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.includes('.') // 画像、フォント、ファビコンなど
  ) {
    return res
  }

  // 2. クライアントサイドルーティングの最適化（高速化）
  // RSCのプリフェッチリクエストはセッション同期（重い処理）をスキップする
  if (req.headers.has('x-middleware-prefetch') || req.headers.get('purpose') === 'prefetch') {
    return res
  }

  // 開発者用バイパス（ローカル開発環境のみ有効）
  const isDev = process.env.NODE_ENV === 'development' && req.cookies.get('axlink_dev_session')?.value === 'DEVELOPER'
  if (isDev) {
    return res
  }

  // 3. セッションの同期 (auth-helpers-nextjs の公式推奨方法)
  try {
    const supabase = createMiddlewareClient({ req, res })
    await supabase.auth.getSession()
  } catch (error) {
    console.error('Middleware session sync error:', error)
  }

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
