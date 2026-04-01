import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    // 仮実装: 認証セッションをチェックして該当ユーザーの目標を返す想定
    // const goals = await prisma.goal.findMany({ where: { userId: 'xxx' } })
    return NextResponse.json({ message: 'Goals endpoint placeholder' })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ message: 'Create or update goal endpoint placeholder' })
}
