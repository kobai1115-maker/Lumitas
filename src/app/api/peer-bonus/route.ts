import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    // ピアボーナスタイムラインの取得 (モック)
    // const bonuses = await prisma.peerBonus.findMany({
    //   orderBy: { createdAt: 'desc' },
    //   include: { sender: true, receiver: true }
    // })
    return NextResponse.json({ message: 'Peer bonus GET endpoint' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch peer bonuses' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { receiverId, points, tag, message } = await req.json()
    
    // const newBonus = await prisma.peerBonus.create({
    //   data: {
    //     senderId: 'demo-sender-id', // セッションから取得
    //     receiverId,
    //     points,
    //     tag,
    //     message
    //   }
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create peer bonus' }, { status: 500 })
  }
}
