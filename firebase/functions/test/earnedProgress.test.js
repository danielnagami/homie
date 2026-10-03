import assert from 'node:assert/strict'
import test from 'node:test'
import { streakFromCompletionDates } from '../lib/earnedProgress.js'
import { levelForXp } from '../lib/leveling.js'

test('rebuilds the current and longest streak from distinct completion days', () => {
  const streak = streakFromCompletionDates(
    new Set(['2026-10-01', '2026-10-02', '2026-10-04', '2026-10-05', '2026-10-06']),
  )

  assert.deepEqual(streak, {
    current: 3,
    longest: 3,
    lastCompletedDate: '2026-10-06',
  })
})

test('clears the streak when undo removes the final completion', () => {
  assert.deepEqual(streakFromCompletionDates(new Set()), {
    current: 0,
    longest: 0,
    lastCompletedDate: '',
  })
})

test('level state falls with reverted lifetime XP and cannot become negative', () => {
  assert.deepEqual(levelForXp(Math.max(0, 120 - 50)), {
    level: 1,
    xp: 70,
    xpIntoLevel: 70,
    xpToNextLevel: 100,
  })
  assert.equal(levelForXp(Math.max(0, 30 - 50)).xp, 0)
})
