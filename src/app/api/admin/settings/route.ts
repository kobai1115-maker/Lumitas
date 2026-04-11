import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

// 認証と法人IDの取得
async function getAuthContext() {
  const { user } = await getServerAuthUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SYSTEM_ADMIN')) {
    return null
  }
  
  // SYSTEM_ADMIN の場合は、何らかのデフォルト法人または操作中の法人を特定する必要がある
  // ここではシンプルに現在のユーザーに紐づく corporationId を使用する。
  // (不整合がある場合はダミーまたは最初の法人を使用する回避策もあるが、基本は紐づきを優先)
  const corporationId = user.corporationId
  if (!corporationId && user.role !== 'SYSTEM_ADMIN') return null
  
  // SYSTEM_ADMIN で corporationId がない場合は、最初の法人を取得（開発用）
  if (!corporationId && user.role === 'SYSTEM_ADMIN') {
    const firstCorp = await prisma.corporation.findFirst()
    return { user, corporationId: firstCorp?.id }
  }

  return { user, corporationId }
}

export async function GET() {
  const ctx = await getAuthContext()
  if (!ctx || !ctx.corporationId) {
    return NextResponse.json({ error: 'Unauthorized or Corporation not found' }, { status: 401 })
  }

  try {
    const corporation = await prisma.corporation.findUnique({
      where: { id: ctx.corporationId },
      include: {
        facilities: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(corporation)
  } catch (error) {
    console.error('GET /api/admin/settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const ctx = await getAuthContext()
  if (!ctx || !ctx.corporationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, facilities } = body

    // 1. 法人名の更新
    if (name) {
      await prisma.corporation.update({
        where: { id: ctx.corporationId },
        data: { name }
      })
    }

    // 2. 拠点の更新（簡易的な同期ロジック）
    if (Array.isArray(facilities)) {
      // 現在の拠点リストを取得
      const currentFacilities = await prisma.facility.findMany({
        where: { corporationId: ctx.corporationId }
      })
      const currentIds = currentFacilities.map(f => f.id)
      const newIds = facilities.map(f => f.id).filter(id => !id.startsWith('l-')) // 新規作成用ID 'l-xxx' を除外

      // 削除された拠点を特定
      const idsToDelete = currentIds.filter(id => !newIds.includes(id))
      if (idsToDelete.length > 0) {
        await prisma.facility.deleteMany({
          where: { id: { in: idsToDelete }, corporationId: ctx.corporationId }
        })
      }

      // 追加・更新
      for (const f of facilities) {
        const data = {
          name: f.name,
          type: f.type,
          address: f.address,
          phoneNumber: f.phone,
          corporationId: ctx.corporationId
        }

        if (f.id && !f.id.startsWith('l-')) {
          // 更新
          await prisma.facility.update({
            where: { id: f.id },
            data
          })
        } else {
          // 新規作成
          await prisma.facility.create({
            data
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/admin/settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
