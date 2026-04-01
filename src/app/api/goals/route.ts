import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || 'demo-user-id'
    
    const goals = await prisma.goal.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(goals.length > 0 ? goals : { message: 'No goals found' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newGoal = await prisma.goal.create({
      data: {
        userId: body.userId || 'demo-user-id',
        title: body.title,
        targetValue: body.targetValue,
        currentValue: body.currentValue || 0,
        unit: body.unit,
        periodKey: body.periodKey || '2026-H1',
        isAchieved: body.isAchieved || false
      }
    })
    return NextResponse.json(newGoal)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
