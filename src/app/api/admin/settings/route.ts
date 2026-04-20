import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { randomUUID } from 'crypto'

// 認証と法人IDの取得
async function getAuthContext() {
  const { user } = await getServerAuthUser()
  if (!user || (user.role !== 'MAIN_ADMIN' && user.role !== 'DEVELOPER')) {
    return null
  }
  
  // SYSTEM_ADMIN の場合は、何らかのデフォルト法人または操作中の法人を特定する必要がある
  // ここではシンプルに現在のユーザーに紐づく corporationId を使用する。
  // (不整合がある場合はダミーまたは最初の法人を使用する回避策もあるが、基本は紐づきを優先)
  const corporationId = user.corporationId
  if (!corporationId && user.role !== 'DEVELOPER') return null
  
  // SYSTEM_ADMIN で corporationId がない場合は、最初の法人を取得（開発用）
  if (!corporationId && user.role === 'DEVELOPER') {
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
        Facility: {
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

    const result = await prisma.$transaction(async (tx) => {
      // 1. 法人名の更新
      if (name) {
        await tx.corporation.update({
          where: { id: ctx.corporationId },
          data: { name }
        })
      }

      // 2. 拠点の更新・同期
      if (Array.isArray(facilities)) {
        const currentFacilities = await tx.facility.findMany({
          where: { corporationId: ctx.corporationId }
        })
        const currentIds = currentFacilities.map(f => f.id)
        const incomingIds = facilities.map(f => f.id).filter(id => !id.startsWith('l-'))

        // 削除対象の特定
        const idsToDelete = currentIds.filter(id => !incomingIds.includes(id))

        if (idsToDelete.length > 0) {
          // 外部キー制約エラーを防ぐため、関連データの facilityId を null にリセット
          const whereClause = { facilityId: { in: idsToDelete } }
          
          await tx.user.updateMany({ where: whereClause, data: { facilityId: null } })
          await tx.evaluation.updateMany({ where: whereClause, data: { facilityId: null } })
          await tx.goal.updateMany({ where: whereClause, data: { facilityId: null } })
          await tx.peerBonus.updateMany({ where: whereClause, data: { facilityId: null } })
          await tx.incidentReport.updateMany({ where: whereClause, data: { facilityId: null } })
          await tx.healthLog.updateMany({ where: whereClause, data: { facilityId: null } })
          await tx.trainingRecord.updateMany({ where: whereClause, data: { facilityId: null } })
          await tx.oneOnOneNote.updateMany({ where: whereClause, data: { facilityId: null } })

          // 拠点を削除
          await tx.facility.deleteMany({
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
            corporationId: ctx.corporationId,
            updatedAt: new Date()
          }

          if (f.id && !f.id.startsWith('l-')) {
            await tx.facility.update({
              where: { id: f.id },
              data
            })
          } else {
            await tx.facility.create({
              data: {
                ...data,
                id: randomUUID()
              }
            })
          }
        }
      }
      return { success: true }
    }, {
      timeout: 10000 // 大量データの更新に備えてタイムアウトを少し延ばす
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('PATCH /api/admin/settings critical error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: error.message 
    }, { status: 500 })
  }
}
