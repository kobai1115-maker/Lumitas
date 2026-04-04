const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// .env ファイルを手動で読み込む（dotenvライブラリがない場合用）
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8')
    env.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        let val = match[2].trim()
        // クォート除去
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
        process.env[match[1].trim()] = val
      }
    })
  }
}

loadEnv()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const prisma = new PrismaClient()

async function sync() {
  console.log('--- USER ID SYNC (SAFE MODE) START ---')
  const email = 'staff1@sample-corp.com'

  // 1. Supabase Auth から本当の ID を取得
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('Auth User List Error:', authError)
    return
  }

  const authUser = users.find(u => u.email === email)
  if (!authUser) {
    console.log(`ERROR: User ${email} not found in Supabase Auth.`)
    return
  }

  console.log('FOUND in Auth ID:', authUser.id)

  // 2. Prisma 側のユーザーを検索
  const dbUser = await prisma.user.findUnique({
    where: { email }
  })

  if (!dbUser) {
    console.log(`ERROR: User ${email} not found in Prisma DB.`)
    return
  }

  console.log('FOUND in DB (Old ID):', dbUser.id)

  // 3. ID が不一致なら強制同期 (SQL直接実行)
  if (dbUser.id !== authUser.id) {
    console.log('ID MISMATCH DETECTED. Syncing via Raw SQL...')
    
    // 主キー制約を回避するため、直接 SQL で更新
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET id = $1 WHERE email = $2`,
      authUser.id,
      email
    )
    console.log('SUCCESS: ID has been synced to Auth ID.')
  } else {
    console.log('ID is already synced. No change needed.')
  }

  console.log('--- SYNC END ---')
}

sync()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
