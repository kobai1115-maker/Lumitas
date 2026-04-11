import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    console.log('Connecting to database...')
    const userCount = await prisma.user.count()
    console.log(`Connection successful. User count: ${userCount}`)
    
    console.log('Attempting to add fullNameKana column via SQL...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fullNameKana" TEXT;`)
    console.log('SQL execution successful.')

    const users = await prisma.user.findMany({
      take: 1,
      select: { id: true, fullName: true, fullNameKana: true }
    })
    console.log('Sample user data:', users)
  } catch (err) {
    console.error('Database connection error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
