const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding multi-tenant data...')

  // 1. 法人の作成
  const corp = await prisma.corporation.upsert({
    where: { id: 'corp-001' },
    update: {},
    create: {
      id: 'corp-001',
      name: '社会福祉法人 萌佑会',
      subdomain: 'moyuukai',
      subscription: 'PREMIUM',
    },
  })
  console.log(`Created Corporation: ${corp.name}`)

  // 2. ユーザーの作成 (法人のみに紐付け)
  const users = [
    { id: 'u1', staffId: 'S001', email: 'yamada@example.com', fullName: '山田 理事長', role: 'ADMIN', dept: '役員会', grade: 7 },
    { id: 'u2', staffId: 'S002', email: 'sato@example.com', fullName: '佐藤 施設長', role: 'MANAGER', dept: '運営部', grade: 6 },
    { id: 'u5', staffId: 'S005', email: 'suzuki@example.com', fullName: '鈴木 太郎', role: 'STAFF_CAREGIVER', dept: '介護課', grade: 2 },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { corporationId: corp.id },
      create: {
        id: u.id,
        staffId: u.staffId,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        department: u.dept,
        gradeLevel: u.grade,
        corporationId: corp.id,
        isActive: true,
      },
    })
    console.log(`Upserted User: ${u.fullName} (Corp: ${corp.name})`)
  }

  // 3. 評価データの作成
  for (const u of users) {
    if (u.id === 'u1') continue
    await prisma.evaluation.create({
      data: {
        corporationId: corp.id,
        employeeId: u.id,
        evaluatorId: 'u1',
        periodKey: '2026-H1',
        status: 'FINALIZED',
        achievementScore: 85,
        competencyScore: 80,
        sentimentScore: 90,
        totalScore: 85.5,
        aiSummaryText: `${u.fullName}さんは今期の目標を達成し、多大なる貢献をされました。`
      }
    })
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
