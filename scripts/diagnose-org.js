const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnose() {
  try {
    const corp = await prisma.corporation.findFirst()
    console.log('🏢 Corp:', corp?.name, 'ID:', corp?.id)

    // ユーザー情報のサマリー取得
    const users = await prisma.user.findMany({
      select: { staffId: true, fullName: true, role: true, corporationId: true }
    })
    console.log(`\n👥 Total Users in DB: ${users.length}`)
    users.forEach(u => {
      console.log(`- [${u.staffId}] ${u.fullName} | Role: ${u.role} | CorpId: ${u.corporationId}`)
    })

    // 単純なカウント
    const count = await prisma.user.count()
    console.log(`\n✅ Safe Count (Total): ${count}`)

  } catch (err) {
    console.error('❌ Diagnose failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

diagnose()
