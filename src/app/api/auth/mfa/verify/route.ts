import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { code } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email
  
  try {
    const gasUrl = process.env.GAS_MFA_URL
    const response = await fetch(gasUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        email: email,
        code: code,
        token: process.env.GAS_MFA_SECRET || 'LUMITAS_MFA_SECRET_2026'
      })
    })

    const result = await response.json()
    if (result.success) {
      // 検証成功時にクッキーをセットして、MiddlewareやLayoutでアクセスを許可する
      const response = NextResponse.json({ success: true })
      response.cookies.set('lumitas_mfa_verified', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24, // 24時間有効
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      return response
    } else {
      return NextResponse.json({ error: result.error || 'Invalid code' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
