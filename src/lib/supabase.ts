import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://abc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'

// エラー回避のための安全な初期化
function createSafeClient() {
  try {
    return createClient(supabaseUrl, supabaseKey)
  } catch (e) {
    console.warn('Supabase initialization failed, using dummy client:', e)
    // 最小限のダミークライアントを返す（getSessionなどが呼ばれても落ちないようにする）
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: { session: null, user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      storage: { from: () => ({}) },
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    } as any
  }
}

export const supabase = createSafeClient()
