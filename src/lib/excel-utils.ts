import * as XLSX from 'xlsx'

/**
 * Excelの行データから、指定された複数の別名（エイリアス）のいずれかに一致するセルの値を取得する
 * @param row Excelの1行分のデータ
 * @param aliases 検索したいカラム名の候補リスト
 * @returns 見つかった値、または空文字
 */
export function getCellValue(row: any, aliases: string[]): string {
  if (!row) return ''
  
  // 余計な空白や記号を削った「正規化キー」のマップを作成
  const normalizedRow: Record<string, any> = {}
  Object.keys(row).forEach(key => {
    const normKey = key.trim().replace(/[\s\t\n\r]/g, '')
    normalizedRow[normKey] = row[key]
  })

  // 候補リストを正規化して検索
  for (const alias of aliases) {
    const normAlias = alias.trim().replace(/[\s\t\n\r]/g, '')
    if (normalizedRow[normAlias] !== undefined) {
      return String(normalizedRow[normAlias]).trim()
    }
  }

  return ''
}

/**
 * ファイルを読み込み、最初のシートのJSONデータを返す
 */
export async function readExcelFirstSheet(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        resolve(json)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

/**
 * スタッフインポート用のマッピング定義
 */
export const STAFF_HEADER_MAP = {
  staffId: ['職員ID', '職員番号', 'ID', 'StaffId', 'staff_id'],
  fullName: ['氏名', '名前', 'Name', 'fullName', 'full_name'],
  fullNameKana: ['フリガナ', 'ふりがな', '氏名（カナ）', 'NameKana', 'kana'],
  email: ['メールアドレス', 'メール', 'Email', 'mail'],
  roleName: ['役職', '役割', '権限', 'Role', 'role'],
  facilityName: ['所属施設', '施設名', '事業所名', 'Facility', 'facility'],
  unitName: ['ユニット名', 'ユニット', '部署', 'Unit', 'unit'],
  gradeLevel: ['等級', '現在の等級', 'Grade', 'grade'],
  department: ['配属部署', '部門', 'Department', 'dept']
}

/**
 * 組織図インポート用のマッピング定義
 */
export const ORG_HEADER_MAP = {
  divisionName: ['部門名', '部', 'Division', 'division_name'],
  facilityName: ['事業所名', '施設名', '拠点名', 'Facility', 'facility_name'],
  unitName: ['ユニット名', 'ユニット', '部署', 'Unit', 'unit_name']
}
