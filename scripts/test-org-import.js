const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx')
const path = require('path')

const prisma = new PrismaClient()

async function testImport() {
  console.log('🚀 Starting Organization Import Test...')

  try {
    // 1. Excelファイルの読み込み
    const filePath = path.join(process.cwd(), 'dummy_org_test.xlsx')
    const wb = XLSX.readFile(filePath)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(ws)

    // 法人IDの取得 (既存のものを1つ選ぶ)
    const corp = await prisma.corporation.findFirst()
    if (!corp) {
      console.error('❌ No corporation found in DB. Please run setup first.')
      return
    }
    const CORP_ID = corp.id
    console.log(`🏢 Target Corporation: ${corp.name} (${CORP_ID})`)

    let results = { divisions: 0, facilities: 0, units: 0 }
    const divisionCache = new Map()
    const facilityCache = new Map()

    // 2. インポートロジックの実行 (APIと同等のロジック)
    for (const row of data) {
      const divisionName = row['部門名'] || ''
      const facilityName = row['事業所名'] || ''
      const unitName = row['ユニット名'] || ''

      if (!facilityName) continue

      // Division
      let divisionId = null
      if (divisionName) {
        if (divisionCache.has(divisionName)) {
          divisionId = divisionCache.get(divisionName)
        } else {
          let div = await prisma.division.findFirst({ where: { name: divisionName, corporationId: CORP_ID } })
          if (!div) {
            div = await prisma.division.create({ data: { name: divisionName, corporationId: CORP_ID } })
            results.divisions++
          }
          divisionId = div.id
          divisionCache.set(divisionName, div.id)
        }
      }

      // Facility
      let facilityId
      const facKey = `${divisionId || 'root'}:${facilityName}`
      if (facilityCache.has(facKey)) {
        facilityId = facilityCache.get(facKey)
      } else {
        let fac = await prisma.facility.findFirst({ where: { name: facilityName, corporationId: CORP_ID, divisionId } })
        if (!fac) {
          fac = await prisma.facility.create({ data: { name: facilityName, corporationId: CORP_ID, divisionId } })
          results.facilities++
        }
        facilityId = fac.id
        facilityCache.set(facKey, fac.id)
      }

      // Unit
      if (unitName) {
        let unit = await prisma.unit.findFirst({ where: { name: unitName, facilityId } })
        if (!unit) {
          await prisma.unit.create({ data: { name: unitName, facilityId } })
          results.units++
        }
      }
    }

    console.log('✅ Import Completed!')
    console.log(`📊 Statistics: Divisions: ${results.divisions}, Facilities: ${results.facilities}, Units: ${results.units}`)

    // 3. 最終確認 (ツリー構造のダンプ)
    const facilities = await prisma.facility.findMany({
      where: { corporationId: CORP_ID },
      include: { units: true, division: true }
    })
    console.log('\n--- Real-time Hierarchy Check ---')
    facilities.forEach(f => {
      console.log(`[${f.division?.name || 'Direct'}] ${f.name} (${f.units.length} units)`)
      f.units.forEach(u => console.log(`  └─ ${u.name}`))
    })

  } catch (error) {
    console.error('❌ Integration Test Failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testImport()
