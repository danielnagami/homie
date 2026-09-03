interface StreakBadgeProps {
  current: number
  longest: number
}

export function StreakBadge({ current }: StreakBadgeProps) {
  return (
    <div className="bg-warm-100 text-warm-500 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M13 2 4.5 13.5h6L9 22l10-12h-6L13 2z" />
      </svg>
      <span>{current} day streak</span>
    </div>
  )
}
