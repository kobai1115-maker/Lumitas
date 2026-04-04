import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser, getAccessScope } from '@/lib/auth-server'

export async function GET() {
  try {
    const { user, error } = await getServerAuthUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // [権限管理] 法人管理者以上のみ施設一覧の取得を許可
    if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const scope = getAccessScope(user)
    
    // システム管理者の場合は全施設、法人管理者の場合は自法人の施設
    const facilities = await (prisma as any).facility.findMany({
      where: scope.corporationId ? { corporationId: scope.corporationId } : {},
      include: {
        corporation: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(facilities)
  } catch (error) {
    console.error('GET /api/admin/facilities error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
