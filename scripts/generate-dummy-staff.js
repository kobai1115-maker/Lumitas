const XLSX = require('xlsx')
const path = require('path')

function generateDummyStaffExcel() {
  const data = [
    // 初期配属データ
    { '職員ID': '1aa0001', '氏名': '佐藤 健太', 'メールアドレス': 'sato@moyuukai.or.jp', '役職': '施設長', '事業所名': '特別養護老人ホーム あおい', 'ユニット名': '1F つばき', '現在の等級': 5, '部署': '管理部' },
    { '職員ID': '1aa0002', '氏名': '田中 美咲', 'メールアドレス': 'tanaka@moyuukai.or.jp', '役職': '介護職', '事業所名': '特別養護老人ホーム あおい', 'ユニット名': '1F もみじ', '現在の等級': 2, '部署': '介護課' },
    { '職員ID': '1ab0001', '氏名': '高橋 浩', 'メールアドレス': 'takahashi@moyuukai.or.jp', '役職': '看護職', '事業所名': '特別養護老人ホーム さくら', 'ユニット名': 'A病棟', '現在の等級': 3, '部署': '看護課' },
    
    // 【異動・昇進シナリオ用データ】
    // 1aa0002 田中さんが「あおい」から「さくら」へ異動し、さらに「施設長」に昇進・等級UPする場合のデータ
    { '職員ID': '1aa0003', '氏名': '鈴木 一郎', 'メールアドレス': 'suzuki@moyuukai.or.jp', '役職': '介護職', '事業所名': 'デイサービス ひばり', 'ユニット名': '午前クラス', '現在の等級': 1, '部署': '介護課' }
  ]

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'StaffList')

  const filePath = path.join(process.cwd(), 'dummy_staff_test.xlsx')
  XLSX.writeFile(wb, filePath)

  console.log(`✅ Dummy Staff Excel generated at: ${filePath}`)
  
  // 異動後のExcelも作成
  const transferData = [
    { '職員ID': '1aa0001', '氏名': '佐藤 健太', 'メールアドレス': 'sato@moyuukai.or.jp', '役職': '施設長', '事業所名': '特別養護老人ホーム あおい', 'ユニット名': '1F つばき', '現在の等級': 5, '部署': '管理部' },
    // 田中さんが異動 & 昇進
    { '職員ID': '1aa0002', '氏名': '田中 美咲', 'メールアドレス': 'tanaka@moyuukai.or.jp', '役職': '施設長', '事業所名': '特別養護老人ホーム さくら', 'ユニット名': 'B病棟', '現在の等級': 4, '部署': '管理部' },
    { '職員ID': '1ab0001', '氏名': '高橋 浩', 'メールアドレス': 'takahashi@moyuukai.or.jp', '役職': '看護職', '事業所名': '特別養護老人ホーム さくら', 'ユニット名': 'A病棟', '現在の等級': 3, '部署': '看護課' },
    { '職員ID': '1aa0003', '氏名': '鈴木 一郎', 'メールアドレス': 'suzuki@moyuukai.or.jp', '役職': '介護職', '事業所名': 'デイサービス ひばり', 'ユニット名': '午前クラス', '現在の等級': 1, '部署': '介護課' }
  ]
  const ws2 = XLSX.utils.json_to_sheet(transferData)
  const wb2 = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb2, ws2, 'StaffListAfterTransfer')
  const filePath2 = path.join(process.cwd(), 'dummy_staff_transfer_test.xlsx')
  XLSX.writeFile(wb2, filePath2)
  console.log(`✅ Transfer scenario Excel generated at: ${filePath2}`)
}

generateDummyStaffExcel()
