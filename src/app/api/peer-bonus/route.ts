import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const bonuses = await prisma.peerBonus.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        sender: { select: { fullName: true, id: true } }, 
        receiver: { select: { fullName: true, id: true } }
      }
    })
    return NextResponse.json(bonuses)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch peer bonuses' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { receiverId, points, tag, message } = await req.json()
    
    const newBonus = await prisma.peerBonus.create({
      data: {
        senderId: 'demo-sender-id', // セッションから取得想定
        receiverId,
        points: points || 5,
        tag,
        message
      }
    })

    return NextResponse.json({ success: true, data: newBonus })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create peer bonus' }, { status: 500 })
  }
}
