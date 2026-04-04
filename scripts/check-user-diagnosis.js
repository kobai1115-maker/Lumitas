const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('--- [JS] USER DATA DIAGNOSIS START ---')
  const email = 'staff1@sample-corp.com'
  
  try {
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
    console.log('Corporation:', user.corporation ? user.corporation.name : '(NULL)')
    console.log('Facility:', user.facility ? user.facility.name : '(NULL)')
    console.log('Unit:', user.unit ? user.unit.name : '(NULL)')
    console.log('WelfarePoints:', user.welfarePoints)
  } catch (err) {
    console.error('Database Connection or Query Error:', err)
  }
  console.log('--- DIAGNOSIS END ---')
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
