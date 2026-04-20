import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { randomUUID } from 'crypto'

async function getAuthContext() {
  const { user } = await getServerAuthUser()
  if (!user || (user.role !== 'MAIN_ADMIN' && user.role !== 'DEVELOPER')) {
    return null
  }
  
  const corporationId = user.corporationId
  if (!corporationId && user.role === 'DEVELOPER') {
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

    // 1. 現在の役職リストを取得
    const currentPositions = await prisma.position.findMany({
      where: { corporationId: ctx.corporationId }
    })
    const currentIds = currentPositions.map(p => p.id)
    const incomingIds = roles.map(r => r.id).filter((id: string | null) => id && !id.startsWith('new-')) as string[]

    // 2. 削除対象の特定
    const idsToDelete = currentIds.filter(id => !incomingIds.includes(id))

    // 3. トランザクションで一括処理
    const result = await prisma.$transaction(async (tx) => {
      // a. 削除される職位に紐付くユーザーを解除
      if (idsToDelete.length > 0) {
        await tx.user.updateMany({
          where: { positionId: { in: idsToDelete } },
          data: { positionId: null }
        })

        // b. 職位を削除
        await tx.position.deleteMany({
          where: { id: { in: idsToDelete }, corporationId: ctx.corporationId }
        })
      }

      // c. 追加・更新
      for (const r of roles) {
        const data = {
          id: r.id && !r.id.startsWith('new-') ? r.id : randomUUID(),
          name: r.name,
          authority: r.authority as 'DEVELOPER' | 'MAIN_ADMIN' | 'SUB_ADMIN' | 'GENERAL',
          rank: r.rank,
          corporationId: ctx.corporationId,
          updatedAt: new Date()
        }

        if (r.id && !r.id.startsWith('new-')) {
          // 既存データの更新
          await tx.position.update({
            where: { id: r.id },
            data
          })
        } else {
          // 新規データの作成
          await tx.position.create({
            data
          })
        }
      }
      return { success: true }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('PATCH /api/admin/roles critical error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: 'Failed to update roles', 
      details: error.message 
    }, { status: 500 })
  }
}
