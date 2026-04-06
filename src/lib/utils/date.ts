import { differenceInMonths, differenceInYears } from 'date-fns'

/**
 * 入社日から現在の勤続年数を計算し、「○年■月」の形式で返します。
 * @param hireDate 入社日
 * @returns 勤続年数の文字列 (例: "2年3ヶ月", "11ヶ月", "0ヶ月")
 */
export function calculateTenure(hireDate: Date | string | null | undefined): string {
  if (!hireDate) return '未登録'

  const start = new Date(hireDate)
  const today = new Date()

  // 無効な日付の場合は空文字
  if (isNaN(start.getTime())) return ''

  const totalMonths = differenceInMonths(today, start)

  if (totalMonths < 0) return '入社前'

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  if (years === 0) {
    return `${months}ヶ月`
  }

  if (months === 0) {
    return `${years}年`
  }

  return `${years}年${months}ヶ月`
}
