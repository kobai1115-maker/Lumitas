import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

/**
 * Next.js App Router 上で動作する Supabase クライアント
 * createBrowserClient を使用することで、ブラウザの Cookie (認証情報) が管理され、
 * API ルートやミドルウェアとの間でセッションが同期されます。
 */
// @ts-ignore
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
