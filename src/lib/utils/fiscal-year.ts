/**
 * 日本の会計年度（4月始まり）を取得するユーティリティ
 */

/**
 * 指定した日付の会計年度を返す (4月1日〜翌年3月31日までが同一年度)
 */
export function getFiscalYear(date: Date = new Date()): number {
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  // 1-3月なら前年を年度とする
  return month < 4 ? year - 1 : year
}

/**
 * 前年度の会計年度を返す
 */
export function getPreviousFiscalYear(date: Date = new Date()): number {
  return getFiscalYear(date) - 1
}

/**
 * 現在が年度の切り替え時期（3月〜4月）であるかを判定する
 */
export function isFiscalYearTransitionPeriod(date: Date = new Date()): boolean {
  const month = date.getMonth() + 1 // 1-indexed
  return month === 3 || month === 4
}

/**
 * システム開始年度(2026年度)から現在までの年度リストを降順で取得する
 * 未来の年度を表示したい場合は引数で調整可能
 */
export function getAvailableFiscalYears(endOffset: number = 0): string[] {
  const startYear = 2026
  const currentFY = getFiscalYear()
  const endYear = currentFY + endOffset
  
  const years: string[] = []
  // 開始年度(2026)を下限とする
  const effectiveStart = Math.max(startYear, 2026)
  
  for (let y = effectiveStart; y <= endYear; y++) {
    years.push(y.toString())
  }
  
  return years.reverse() // 最新を一番上に
}

/**
 * 年度ごとの表示用ラベルを取得する (例: "2026年度")
 */
export function getFiscalYearLabel(year: string | number): string {
  return `${year}年度`
}
