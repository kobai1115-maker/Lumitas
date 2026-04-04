const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx')
const path = require('path')

const prisma = new PrismaClient()

async function testStaffImport() {
  console.log('🚀 Starting Staff Import Integration Test...')

  try {
    const corp = await prisma.corporation.findFirst()
    if (!corp) return console.error('❌ Corp not found')
    const CORP_ID = corp.id

    // ヘルパー: 役職マッピング (APIと共通)
    const ROLE_MAP = {
      '法人管理者': 'ADMIN',
      '施設長': 'MANAGER',
      '介護職': 'STAFF_CAREGIVER',
      '看護職': 'STAFF_NURSE',
      '事務職': 'STAFF_OFFICE',
      '生活相談員': 'STAFF_SOCIAL_WORKER'
    }

    // インポート実行関数
    async function runImport(fileName) {
      console.log(`\n📂 Reading file: ${fileName}`)
      const wb = XLSX.readFile(path.join(process.cwd(), fileName))
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      
      let res = { created: 0, updated: 0 }
      for (const row of data) {
        const staffId = String(row['職員ID'])
        const facilityName = row['事業所名']
        
        // 施設IDの解決
        const fac = await prisma.facility.findFirst({ where: { name: facilityName, corporationId: CORP_ID } })
        const facilityId = fac ? fac.id : null

        // Upsert
        const existing = await prisma.user.findUnique({ where: { staffId } })
        const userData = {
          fullName: row['氏名'],
          email: row['メールアドレス'],
          role: ROLE_MAP[row['役職']] || 'STAFF_CAREGIVER',
          gradeLevel: Number(row['現在の等級']),
          department: row['部署'],
          facilityId,
          corporationId: CORP_ID
        }

        if (existing) {
          await prisma.user.update({ where: { staffId }, data: userData })
          res.updated++
        } else {
          await prisma.user.create({ data: { ...userData, staffId, mustChangePassword: true } })
          res.created++
        }
      }
      console.log(`📊 Result: Created: ${res.created}, Updated: ${res.updated}`)
    }

    // 1. 初回インポート
    await runImport('dummy_staff_test.xlsx')

    // 2. 異動・昇進(再インポート)
    await runImport('dummy_staff_transfer_test.xlsx')

    // 3. 検証: 田中美咲さん (1aa0002) の状態
    const tanaka = await prisma.user.findUnique({ 
      where: { staffId: '1aa0002' },
      include: { facility: true }
    })

    console.log('\n--- 🎯 Verification: Tanaka Misaki (1aa0002) ---')
    console.log(`Name: ${tanaka.fullName}`)
    console.log(`Role: ${tanaka.role} (Expected: MANAGER)`)
    console.log(`Facility: ${tanaka.facility?.name} (Expected: 特別養護老人ホーム さくら)`)
    console.log(`Grade: ${tanaka.gradeLevel} (Expected: 4)`)

    const totalCount = await prisma.user.count({ where: { corporationId: CORP_ID, NOT: { role: 'SYSTEM_ADMIN' } } })
    console.log(`\n✅ Total Staff in Corp: ${totalCount} (Expected: 4)`)

  } catch (error) {
    console.error('❌ Integration Test Failed!')
    if (error.code) console.error(`Error Code: ${error.code}`)
    if (error.meta) console.error(`Metadata: ${JSON.stringify(error.meta)}`)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testStaffImport()
