import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'edge'

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
    console.error('GET /api/peer-bonus error (Serving mock data for demo):', error)

    // デモ用ダミーデータ
    const mockBonuses = [
      {
        id: 'mock-b1',
        points: 5,
        tag: '助け合い',
        message: '急な欠員で忙しい中、嫌な顔一つせず手伝ってくれて本当に助かりました！ありがとうございます。',
        sender: { id: 's1', fullName: '佐藤 美咲' },
        receiver: { id: 'r1', fullName: 'AXLINK管理者' },
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-b2',
        points: 10,
        tag: '専門性',
        message: 'A様の移乗介助での新しいアプローチ、とても参考になりました。さすがです！',
        sender: { id: 's2', fullName: 'AXLINK管理者' },
        receiver: { id: 'r2', fullName: '田中 健一' },
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
    return NextResponse.json(mockBonuses)
  }
}

export async function POST(req: Request) {
  try {
    const { receiverId, points, tag, message } = await req.json()
    
    const newBonus = await prisma.peerBonus.create({
      data: {
        corporationId: 'corp-001',
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
