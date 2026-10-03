export const FALLBACK_TIME_ZONE = 'UTC'

export function validTimeZone(timeZone?: string | null): string {
  if (!timeZone) return FALLBACK_TIME_ZONE
  try {
    new Intl.DateTimeFormat(undefined, { timeZone })
    return timeZone
  } catch {
    return FALLBACK_TIME_ZONE
  }
}

function calendarParts(date: Date, timeZone: string): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: validTimeZone(timeZone),
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
}

export function toDateKey(date: Date, timeZone: string): string {
  const parts = calendarParts(date, timeZone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function shiftDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function toWeekKey(date: Date, timeZone: string): string {
  const dateKey = toDateKey(date, timeZone)
  const weekday = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay()
  return shiftDateKey(dateKey, -weekday)
}

export function toMonthKey(date: Date, timeZone: string): string {
  return toDateKey(date, timeZone).slice(0, 7)
}

export function isActiveStreak(lastCompletedDate: string | undefined, now: Date, timeZone: string): boolean {
  if (!lastCompletedDate) return false

  const today = toDateKey(now, timeZone)
  return lastCompletedDate === today || lastCompletedDate === shiftDateKey(today, -1)
}
