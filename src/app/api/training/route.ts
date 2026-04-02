import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'



// 遐比ｿｮ蜿ょ刈險倬鹸縺ｮ蜿門ｾ・export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    const records = await prisma.trainingRecord.findMany({
      where: { userId },
      include: {
        user: { select: { fullName: true, department: true } },
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(records)
  } catch (error) {
    console.error('GET /api/training error:', error)
    return NextResponse.json({ error: '遐比ｿｮ險倬鹸縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆' }, { status: 500 })
  }
}

// 遐比ｿｮ險倬鹸縺ｮ菫晏ｭ假ｼ九・繧､繝ｳ繝井ｻ倅ｸ・export async function POST(req: Request) {
  try {
    const { userId, title, type, date, hours, reportContent, imageUrl } = await req.json()

    if (!userId || !title || !type || !date || !hours) {
      return NextResponse.json({ error: '蠢・磯・岼縺御ｸ崎ｶｳ縺励※縺・∪縺・ }, { status: 400 })
    }

    // OJT/OffJT縺ｫ繧医ｋ繝昴う繝ｳ繝郁ｨｭ螳夲ｼ井ｻｮ縺ｮ繝ｭ繧ｸ繝・け: OJT 5pt, OFF_JT 10pt・・    const earnedPoints = type === 'OFF_JT' || type === 'BOOK' ? 10 : 5

    // 1. 遐比ｿｮ險倬鹸繧剃ｽ懈・
    const record = await prisma.trainingRecord.create({
      data: {
        corporationId: 'corp-001',
        userId,
        title,
        type,
        date: new Date(date),
        hours: parseFloat(hours),
        reportContent: reportContent || null,
        earnedPoints,
        pointsGranted: false,
        imageUrl: imageUrl || null,
      }
    })

    // 2. 譛ｬ莠ｺ縺ｫ繝昴う繝ｳ繝井ｻ倅ｸ趣ｼ井ｺ碁㍾莉倅ｸ朱亟豁｢・・    if (!record.pointsGranted) {
      await prisma.user.update({
        where: { id: userId },
        data: { welfarePoints: { increment: record.earnedPoints } }
      })

      // 莉倅ｸ取ｸ医∩繝輔Λ繧ｰ繧堤ｫ九※繧・      await prisma.trainingRecord.update({
        where: { id: record.id },
        data: { pointsGranted: true }
      })
    }

    return NextResponse.json({
      success: true,
      record,
      pointsGranted: record.earnedPoints
    })
  } catch (error) {
    console.error('POST /api/training error:', error)
    return NextResponse.json({ error: '遐比ｿｮ險倬鹸縺ｮ菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆' }, { status: 500 })
  }
}
