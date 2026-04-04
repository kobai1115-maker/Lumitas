import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- USER DATA DIAGNOSIS START ---')
  const email = 'staff1@sample-corp.com'
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      corporation: true,
      facility: true,
      division: true,
      unit: true
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
  console.log('Corporation:', user.corporation?.name || '(NULL)')
  console.log('Facility:', user.facility?.name || '(NULL)')
  console.log('Unit:', user.unit?.name || '(NULL)')
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
