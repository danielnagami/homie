export interface StreakState {
  current: number
  longest: number
  lastCompletedDate: string
}

export function previousDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  if (![year, month, day].every((part) => Number.isInteger(part))) return ''
  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime())) return ''
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export function streakFromCompletionDates(dateKeys: Set<string>): StreakState {
  const ordered = [...dateKeys].sort()
  if (ordered.length === 0) {
    return { current: 0, longest: 0, lastCompletedDate: '' }
  }

  let currentRun = 1
  let longest = 1
  let finalRun = 1
  for (let index = 1; index < ordered.length; index += 1) {
    if (previousDateKey(ordered[index]) === ordered[index - 1]) {
      currentRun += 1
    } else {
      currentRun = 1
    }
    longest = Math.max(longest, currentRun)
    if (index === ordered.length - 1) finalRun = currentRun
  }

  return {
    current: finalRun,
    longest,
    lastCompletedDate: ordered[ordered.length - 1],
  }
}
