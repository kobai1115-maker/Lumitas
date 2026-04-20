const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Database Preparation (Production Ready) ---')

  // 1. デフォルト法人の作成
  const corp = await prisma.corporation.upsert({
    where: { id: 'corp-default' },
    update: {},
    create: {
      id: 'corp-default',
      name: '新規導入法人',
      subdomain: 'default',
      subscription: 'FREE',
    },
  })
  console.log(`✅ Default Corporation Created: ${corp.name}`)

  // 2. 標準役職（Positions）の作成
  const defaultPositions = [
    { name: '理事長', authority: 'ALL', rank: 1 },
    { name: '施設長', authority: 'ALL', rank: 2 },
    { name: '介護課長', authority: 'DEPARTMENT', rank: 3 },
    { name: '介護主任', authority: 'SUBORDINATES', rank: 4 },
    { name: 'リーダー', authority: 'SUBORDINATES', rank: 5 },
    { name: '一般職', authority: 'SELF', rank: 6 },
  ]

  for (const pos of defaultPositions) {
    await prisma.position.upsert({
      where: { 
        name_corporationId: { 
          name: pos.name, 
          corporationId: corp.id 
        } 
      },
      update: { authority: pos.authority, rank: pos.rank },
      create: {
        name: pos.name,
        authority: pos.authority,
        rank: pos.rank,
        corporationId: corp.id
      }
    })
  }
  console.log('✅ Standard Positions Initialized')

  // 3. デベロッパー用特権アカウント (dev-master) の作成
  // id: 'dev-master' は getServerAuthUser.ts のバイパスロジックと一致させます
  await prisma.user.upsert({
    where: { id: 'dev-master' },
    update: { 
      role: 'SYSTEM_ADMIN',
      corporationId: corp.id 
    },
    create: {
      id: 'dev-master',
      staffId: 'developer',
      email: 'dev@caregrow.ai',
      fullName: 'システム開発者',
      role: 'SYSTEM_ADMIN',
      department: 'システム管理部',
      corporationId: corp.id,
      isActive: true,
      mustChangePassword: false
    }
  })
  console.log('✅ Developer User (dev-master) Created in Database')

  console.log('\n--- Setup Completed Successfully ---')
  console.log('モックデータ（評価実績、履歴等）は一切含まれていません。')
  console.log('デベロッパー用クッキー（axlink_dev_session=SYSTEM_ADMIN）を使用して即座にログイン可能です。')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
