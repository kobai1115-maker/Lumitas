import { createClient } from '@supabase/supabase-js'
import { PrismaClient, Role } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const prisma = new PrismaClient()

async function main() {
  const email = 'staff1@sample-corp.com'
  const password = 'password123'
  const staffId = '1001'

  console.log(`Setting up test user: ${email}...`)

  // 1. Ensure Corporation, Facility, and Unit exist
  let corp = await prisma.corporation.findFirst()
  if (!corp) {
    corp = await prisma.corporation.create({
      data: { id: 'corp-sample-123', name: 'サンプル法人', subdomain: 'sample', updatedAt: new Date() }
    })
    console.log('Created Corporation')
  }

  let facility = await prisma.facility.findFirst({ where: { corporationId: corp.id } })
  if (!facility) {
    facility = await prisma.facility.create({
      data: { id: 'fac-sample-123', name: '東松戸ケアセンター', corporationId: corp.id, updatedAt: new Date() }
    })
    console.log('Created Facility')
  }

  let unit = await prisma.unit.findFirst({ where: { facilityId: facility.id } })
  if (!unit) {
    unit = await prisma.unit.create({
      data: { id: 'unit-sample-123', name: '1階 ユニットA', facilityId: facility.id, updatedAt: new Date() }
    })
    console.log('Created Unit')
  }

  // 2. Setup User in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: '一般スタッフA' }
  })

  let userId: string

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('User already exists in Supabase Auth. Searching for existing ID...')
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
      if (listError) throw listError
      const existingUser = listData.users.find(u => u.email === email)
      if (!existingUser) throw new Error('Existing user not found in list')
      userId = existingUser.id
      
      // Update password just in case
      await supabase.auth.admin.updateUserById(userId, { password })
      console.log('Updated existing user password')
    } else {
      throw authError
    }
  } else {
    userId = authData.user.id
    console.log('Created User in Supabase Auth')
  }

  // 3. Setup User in Prisma DB
  await prisma.user.upsert({
    where: { email },
    update: {
      id: userId,
      staffId,
      fullName: '一般スタッフA',
      role: Role.GENERAL,
      corporationId: corp.id,
      facilityId: facility.id,
      unitId: unit.id,
      isActive: true,
      updatedAt: new Date()
    },
    create: {
      id: userId,
      staffId,
      email,
      fullName: '一般スタッフA',
      role: Role.GENERAL,
      corporationId: corp.id,
      facilityId: facility.id,
      unitId: unit.id,
      isActive: true,
      department: '介護部',
      updatedAt: new Date()
    }
  })

  console.log('Setup Successful! You can now log in.')
}

main()
  .catch(e => {
    console.error('Setup failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
