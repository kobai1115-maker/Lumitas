import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'

// SYSTEM_ADMIN のみがアクセス可能
async function checkAuth() {
  const { user } = await getServerAuthUser()
  if (!user || user.role !== 'SYSTEM_ADMIN') {
    return null
  }
  return user
}

export async function GET() {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const corporations = await prisma.corporation.findMany({
      include: {
        _count: {
          select: { facilities: true, users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(corporations)
  } catch (error) {
    console.error('GET /api/admin/system/corporations error:', error)
    return NextResponse.json({ error: '法人情報の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, subdomain, address, phoneNumber, representativeName, email } = body

    if (!name) {
      return NextResponse.json({ error: '法人名は必須です' }, { status: 400 })
    }

    const corporation = await prisma.corporation.create({
      data: {
        name,
        subdomain: subdomain || null,
        address: address || null,
        phoneNumber: phoneNumber || null,
        representativeName: representativeName || null,
        email: email || null,
        isActive: true,
      }
    })

    return NextResponse.json(corporation)
  } catch (error) {
    console.error('POST /api/admin/system/corporations error:', error)
    return NextResponse.json({ error: '法人情報の登録に失敗しました' }, { status: 500 })
  }
}
