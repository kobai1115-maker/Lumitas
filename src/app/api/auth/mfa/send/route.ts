import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email
  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 400 })
  }

  try {
    // GASのWeb App URL（ユーザーがデプロイした後に環境変数に設定することを想定）
    const gasUrl = process.env.GAS_MFA_URL
    if (!gasUrl) {
       console.error('GAS_MFA_URL is not set')
       return NextResponse.json({ error: 'System configuration error' }, { status: 500 })
    }

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        email: email,
        token: process.env.GAS_MFA_SECRET || 'LUMITAS_MFA_SECRET_2026'
      })
    })

    const result = await response.json()
    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || 'Failed to send code' }, { status: 500 })
    }
  } catch (error) {
    console.error('MFA Send Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
