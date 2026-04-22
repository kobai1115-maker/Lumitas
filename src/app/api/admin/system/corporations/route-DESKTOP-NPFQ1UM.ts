import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerAuthUser } from '@/lib/auth-server'
import { randomUUID } from 'crypto'

// SYSTEM_ADMIN のみがアクセス可能
async function checkAuth() {
  const { user } = await getServerAuthUser()
  if (!user || user.role !== 'DEVELOPER') {
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
          select: { Facility: true, User: true }
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
        id: randomUUID(),
        name,
        subdomain: subdomain || null,
        address: address || null,
        phoneNumber: phoneNumber || null,
        representativeName: representativeName || null,
        email: email || null,
        isActive: true,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(corporation)
  } catch (error) {
    console.error('POST /api/admin/system/corporations error:', error)
    return NextResponse.json({ error: '法人情報の登録に失敗しました' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, name, subdomain, address, phoneNumber, representativeName, email, isActive } = body

    if (!id) {
      return NextResponse.json({ error: '法人IDは必須です' }, { status: 400 })
    }

    const corporation = await prisma.corporation.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subdomain !== undefined && { subdomain }),
        ...(address !== undefined && { address }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(representativeName !== undefined && { representativeName }),
        ...(email !== undefined && { email }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(corporation)
  } catch (error) {
    console.error('PATCH /api/admin/system/corporations error:', error)
    return NextResponse.json({ error: '法人情報の更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '法人IDは必須です' }, { status: 400 })
    }

    // 論理削除
    const corporation = await prisma.corporation.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, corporation })
  } catch (error) {
    console.error('DELETE /api/admin/system/corporations error:', error)
    return NextResponse.json({ error: '法人情報の削除に失敗しました' }, { status: 500 })
  }
}
