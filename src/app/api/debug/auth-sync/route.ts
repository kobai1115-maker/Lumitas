import { NextResponse } from 'next/server'
// @ts-ignore
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

/**
 * 認証 ID と DB ID の整合性を徹底的に調査するデバッグ API
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No Session Found' }, { status: 401 })
    }

    const authId = session.user.id
    const authEmail = session.user.email

    // DB 側を email で逆引きしてみる
    const dbUser = await (prisma.user as any).findUnique({
      where: { email: authEmail },
      include: { unit: true }
    })

    return NextResponse.json({
      debug_info: {
        current_auth_id: authId,
        current_auth_email: authEmail,
        db_user_id: dbUser ? dbUser.id : 'NOT_FOUND_IN_DB',
        is_id_matched: dbUser ? dbUser.id === authId : false,
        db_fullName: dbUser ? dbUser.fullName : 'N/A'
      }
    })
  } catch (err) {
    return NextResponse.json({ error: (err as any).message }, { status: 500 })
  }
}
