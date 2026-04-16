/**
 * Date utilities for daily-reset logic and login-streak tracking.
 */

/** Returns today's date as 'YYYY-MM-DD'. */
export function getTodayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns true if `lastLoginDate` is from a different calendar day than today.
 * Also returns true if `lastLoginDate` is empty/invalid (first launch).
 */
export function isNewDay(lastLoginDate: string): boolean {
  if (!lastLoginDate) return true
  return lastLoginDate !== getTodayString()
}

/**
 * Returns the number of whole calendar days between two 'YYYY-MM-DD' strings.
 * Result is always non-negative (absolute difference).
 */
export function getDaysBetween(a: string, b: string): number {
  const dateA = new Date(a)
  const dateB = new Date(b)
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.abs(Math.round((dateB.getTime() - dateA.getTime()) / msPerDay))
}

/**
 * Formats a 'YYYY-MM-DD' string into a human-readable Chinese date, e.g. "2026年4月15日".
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * Calculates the new login streak.
 * - If the player last logged in yesterday → streak + 1
 * - If the player last logged in today (same day call) → streak unchanged
 * - If the gap is > 1 day → streak resets to 1
 * - If lastLoginDate is empty → streak = 1
 */
export function getLoginStreak(lastLoginDate: string, currentStreak: number): number {
  if (!lastLoginDate) return 1

  const today = getTodayString()
  if (lastLoginDate === today) return currentStreak   // already counted today

  const gap = getDaysBetween(lastLoginDate, today)

  if (gap === 1) return currentStreak + 1    // consecutive day
  return 1                                   // streak broken
}
