interface StreakBadgeProps {
  current: number
  longest: number
}

export function StreakBadge({ current, longest }: StreakBadgeProps) {
  return (
    <div className="rounded-3xl bg-coral-100 p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-extrabold uppercase tracking-wider text-coral-700">Daily streak</span>
        <span className="text-2xl">🔥</span>
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold text-ink">{current} days</p>
      <p className="text-xs font-bold text-pebble">Longest cozy run: {longest} days</p>
    </div>
  )
}
