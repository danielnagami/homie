export const MIN_LEVEL = 1

export function xpThresholdForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level))
  return (100 * n * (n - 1)) / 2
}

export interface LevelState {
  level: number
  xp: number
  xpIntoLevel: number
  xpToNextLevel: number
}

export function levelForXp(xp: number): LevelState {
  const safeXp = Math.max(0, Math.floor(xp))
  let level = MIN_LEVEL
  while (safeXp >= xpThresholdForLevel(level + 1)) {
    level += 1
  }
  const currentThreshold = xpThresholdForLevel(level)
  const nextThreshold = xpThresholdForLevel(level + 1)
  return {
    level,
    xp: safeXp,
    xpIntoLevel: safeXp - currentThreshold,
    xpToNextLevel: nextThreshold - currentThreshold,
  }
}