const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const fullName = process.argv[3] || 'System Administrator'
  const staffId = process.argv[4] || 'SYS0001'

  if (!email) {
    console.log('Usage: node scripts/create-system-admin.js <email> [fullName] [staffId]')
    return
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        staffId,
        role: 'SYSTEM_ADMIN',
        department: 'Development/Operations',
        gradeLevel: 7,
        mustChangePassword: true,
        // corporationId は Optional になったため、null で作成
        corporationId: null 
      }
    })

    console.log('✅ System Admin created successfully:')
    console.log(user)
  } catch (error) {
    console.error('❌ Failed to create System Admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
