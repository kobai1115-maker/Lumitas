const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

function generateDummyOrgExcel() {
  const data = [
    { '部門名': '入所第一部', '事業所名': '特別養護老人ホーム あおい', 'ユニット名': '1F つばき' },
    { '部門名': '入所第一部', '事業所名': '特別養護老人ホーム あおい', 'ユニット名': '1F もみじ' },
    { '部門名': '入所第一部', '事業所名': '特別養護老人ホーム さくら', 'ユニット名': 'A病棟' },
    { '部門名': '入所第一部', '事業所名': '特別養護老人ホーム さくら', 'ユニット名': 'B病棟' },
    { '部門名': '在宅事業部', '事業所名': 'デイサービス ひばり', 'ユニット名': '午前クラス' },
    { '部門名': '在宅事業部', '事業所名': 'デイサービス ひばり', 'ユニット名': '午後クラス' },
    { '部門名': '在宅事業部', '事業所名': 'ヘルパーステーション もも', 'ユニット名': '' },
    { '部門名': '', '事業所名': '本部事務局', 'ユニット名': '管理係' }
  ]

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'OrganizationTree')

  const filePath = path.join(process.cwd(), 'dummy_org_test.xlsx')
  XLSX.writeFile(wb, filePath)

  console.log(`✅ Dummy Excel generated at: ${filePath}`)
  return filePath
}

generateDummyOrgExcel()
