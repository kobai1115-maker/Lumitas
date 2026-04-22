import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- USER DATA DIAGNOSIS START ---')
  const email = 'staff1@sample-corp.com'
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      Corporation: true,
      Facility: true,
      Division: true,
      Unit: true
    }
  })

  if (!user) {
    console.log(`ERROR: User ${email} NOT FOUND in Prisma DB.`)
    return
  }

  console.log('SUCCESS: User record found.')
  console.log('ID:', user.id)
  console.log('FullName:', user.fullName || '(EMPTY)')
  console.log('Department:', user.department || '(EMPTY)')
  console.log('GradeLevel:', user.gradeLevel)
  console.log('Corporation:', user.Corporation?.name || '(NULL)')
  console.log('Facility:', user.Facility?.name || '(NULL)')
  console.log('Unit:', user.Unit?.name || '(NULL)')
  console.log('--- DIAGNOSIS END ---')
}

main()
  .catch(e => {
    console.error('Diagnosis Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
