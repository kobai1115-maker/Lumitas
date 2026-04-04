import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'



export async function GET(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // フィルタ条件の構築
    const where: any = {
      corporationId: user.corporationId
    }

    // [権限管理] 法人管理者以外は、自施設内のやり取りのみ
    if (user.role !== 'ADMIN') {
      where.facilityId = user.facilityId
    }

    const bonuses = await (prisma.peerBonus as any).findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { 
        sender: { select: { fullName: true, id: true, staffId: true } }, 
        receiver: { select: { fullName: true, id: true, staffId: true } }
      }
    })
    return NextResponse.json(bonuses)
  } catch (error) {
    console.error('GET /api/peer-bonus error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { user, error } = await getServerAuthUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId, points, tag, message } = await req.json()
    
    const newBonus = await (prisma.peerBonus as any).create({
      data: {
        corporationId: user.corporationId,
        facilityId: user.facilityId, // 送信者の所属施設に紐付ける
        senderId: user.id, // 自分のセッションIDを固定
        receiverId,
        points: points || 5,
        tag,
        message
      }
    })

    return NextResponse.json({ success: true, data: newBonus })
  } catch (error) {
    console.error('POST /api/peer-bonus error:', error)
    return NextResponse.json({ error: 'Failed to create peer bonus' }, { status: 500 })
  }
}
