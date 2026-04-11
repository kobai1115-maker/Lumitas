import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

async function getAuthContext() {
  const { user } = await getServerAuthUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SYSTEM_ADMIN')) {
    return null
  }
  
  const corporationId = user.corporationId
  if (!corporationId && user.role === 'SYSTEM_ADMIN') {
    const firstCorp = await prisma.corporation.findFirst()
    return { user, corporationId: firstCorp?.id }
  }
  return { user, corporationId }
}

export async function GET() {
  const ctx = await getAuthContext()
  if (!ctx || !ctx.corporationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const positions = await prisma.position.findMany({
      where: { corporationId: ctx.corporationId },
      orderBy: { rank: 'asc' }
    })
    return NextResponse.json(positions)
  } catch (error) {
    console.error('GET /api/admin/roles error:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const ctx = await getAuthContext()
  if (!ctx || !ctx.corporationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { roles } = body // Array of PositionDefinition

    if (!Array.isArray(roles)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    // 現在の役職リストを取得
    const currentPositions = await prisma.position.findMany({
      where: { corporationId: ctx.corporationId }
    })
    const currentIds = currentPositions.map(p => p.id)
    const incomingIds = roles.map(r => r.id).filter(id => !id.startsWith('new-'))

    // 削除処理
    const idsToDelete = currentIds.filter(id => !incomingIds.includes(id))
    if (idsToDelete.length > 0) {
      // ユーザーが紐付いている場合は削除できないようにする（またはリレーションをNULLにする）
      // 今回はシンプルに削除。実際にはUser.positionIdをNULLにする処理が必要かもしれない
      await prisma.user.updateMany({
        where: { positionId: { in: idsToDelete } },
        data: { positionId: null }
      })
      await prisma.position.deleteMany({
        where: { id: { in: idsToDelete }, corporationId: ctx.corporationId }
      })
    }

    // 追加・更新処理
    for (const r of roles) {
      const data = {
        name: r.name,
        authority: r.authority,
        rank: r.rank,
        corporationId: ctx.corporationId
      }

      if (r.id && !r.id.startsWith('new-')) {
        await prisma.position.update({
          where: { id: r.id },
          data
        })
      } else {
        await prisma.position.create({
          data
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/admin/roles error:', error)
    return NextResponse.json({ error: 'Failed to update roles' }, { status: 500 })
  }
}
