import { cookies } from 'next/headers'
// @ts-ignore
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import prisma from '@/lib/prisma'

/**
 * ログインユーザーのプロファイルを Prisma から取得するサーバーサイド用ヘルパー
 * @returns {Promise<{ user: any, error: any }>}
 */
export async function getServerAuthUser() {
  try {
    const cookieStore = await cookies()
    
    // @ts-ignore (createBrowserClient / createServerClient 形式への移行)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // サーバーコンポーネント内では set は不可な場合がある
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // 同上
            }
          },
        },
      }
    )

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // [開発用バイパス] デベロッパー用クッキーがある場合はモックユーザーを返す
    const devSession = cookieStore.get('axlink_dev_session')?.value
    if (devSession === 'SYSTEM_ADMIN') {
      return { 
        user: { 
          id: 'dev-master', 
          staffId: 'developer', 
          fullName: '開発者特権アカウント', 
          role: 'SYSTEM_ADMIN',
          corporationId: null 
        }, 
        error: null 
      }
    }

    if (sessionError || !session || !session.user) {
      return { user: null, error: 'Unauthorized' }
    }

    // Prisma から拡張プロファイルを取得
    const user = await (prisma.user as any).findUnique({
      where: { id: session.user.id },
      include: {
        corporation: true,
        facility: true,
        division: true,
        unit: true
      }
    })

    if (!user) {
      return { user: null, error: 'User profile not found' }
    }

    // [管理用ロジック] システム管理者は法人を跨げるためそのまま返す
    return { user, error: null }
  } catch (err) {
    console.error('getServerAuthUser error:', err)
    return { user: null, error: 'Internal Server Error' }
  }
}

/**
 * 権限（Role）チェックと施設フィルタ用のクエリ条件を生成するヘルパー
 * @param {any} user 
 * @returns {{ corporationId?: string, facilityId?: string }}
 */
export function getAccessScope(user: any) {
  // システム管理者は全範囲（フィルターなし）
  if (user.role === 'SYSTEM_ADMIN') {
    return {}
  }

  const CORP_ID = user.corporationId

  // 法人管理者の場合は法人内すべて
  if (user.role === 'ADMIN') {
    return { corporationId: CORP_ID }
  }

  // 施設長・スタッフの場合は、その施設に限定
  return { 
    corporationId: CORP_ID,
    facilityId: user.facilityId 
  }
}
