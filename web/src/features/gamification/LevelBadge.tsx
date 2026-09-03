interface LevelBadgeProps {
  level: number
  xp?: number
  xpToNextLevel?: number
}

export function LevelBadge({ level, xp = 0, xpToNextLevel = 100 }: LevelBadgeProps) {
  const progress = Math.min(100, Math.round((xp / xpToNextLevel) * 100))

  return (
    <div className="flex items-center gap-3">
      <span className="bg-warm-400 font-display rounded-full px-3 py-1 text-sm font-bold text-white">
        Lv {level}
      </span>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
        <div className="bg-brand-500 h-full rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
