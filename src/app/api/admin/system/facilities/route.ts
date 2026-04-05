import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

async function checkAuth() {
  const { user } = await getServerAuthUser()
  if (!user || user.role !== 'SYSTEM_ADMIN') {
    return null
  }
  return user
}

export async function GET(req: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const corporationId = searchParams.get('corporationId')

    const where = corporationId ? { corporationId } : {}

    const facilities = await prisma.facility.findMany({
      where,
      include: {
        corporation: { select: { name: true } },
        _count: { select: { units: true, users: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(facilities)
  } catch (error) {
    console.error('GET /api/admin/system/facilities error:', error)
    return NextResponse.json({ error: '拠点情報の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, corporationId, divisionId, address, phoneNumber, email } = body

    if (!name || !corporationId) {
      return NextResponse.json({ error: '拠点名と法人IDは必須です' }, { status: 400 })
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        corporationId,
        divisionId: divisionId || null,
        address: address || null,
        phoneNumber: phoneNumber || null,
        email: email || null,
      },
      include: {
        corporation: { select: { name: true } }
      }
    })

    return NextResponse.json(facility)
  } catch (error) {
    console.error('POST /api/admin/system/facilities error:', error)
    return NextResponse.json({ error: '拠点情報の登録に失敗しました' }, { status: 500 })
  }
}
