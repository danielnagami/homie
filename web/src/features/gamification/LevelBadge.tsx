interface LevelBadgeProps {
  level: number
  xp?: number
  xpIntoLevel?: number
  xpToNextLevel?: number
}

function xpThresholdForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level))
  return (100 * safeLevel * (safeLevel - 1)) / 2
}

export function LevelBadge({ level, xp = 780, xpIntoLevel, xpToNextLevel = 1000 }: LevelBadgeProps) {
  const earnedInLevel = xpIntoLevel ?? Math.max(0, xp - xpThresholdForLevel(level))
  const progress = Math.min(100, Math.round((earnedInLevel / xpToNextLevel) * 100))
  const circumference = 427.26
  const dashOffset = circumference - (circumference * progress) / 100

  return (
    <section className="relative overflow-hidden rounded-4xl bg-white p-5 text-center shadow-card">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-coral-100 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-honey-100 blur-2xl" />
      <div className="relative z-10">
        <span className="mb-4 inline-flex rounded-full bg-honey-100 px-4 py-1 font-display text-xs font-extrabold text-honey-700 shadow-[0_2px_0_rgba(200,159,57,0.4)]">
          x1.5 XP Active today
        </span>
        <div className="relative mx-auto my-2 grid h-44 w-44 place-items-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" fill="transparent" r="68" stroke="#f3f2ff" strokeLinecap="round" strokeWidth="12" />
            <circle
              cx="80"
              cy="80"
              fill="transparent"
              r="68"
              stroke="#ff7e67"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              strokeWidth="12"
            />
          </svg>
          <div className="absolute grid h-28 w-28 place-items-center rounded-full bg-lavender-100 shadow-inner">
            <div>
              <span className="mx-auto mb-1 grid h-10 w-10 place-items-center rounded-full bg-mint-200 text-xl">🪴</span>
              <span className="block font-display text-xl font-extrabold text-coral-400">Lvl {level}</span>
              <span className="block font-display text-[10px] font-extrabold uppercase text-pebble">Nest Builder</span>
            </div>
          </div>
        </div>
        <h2 className="font-display text-2xl font-extrabold text-ink">Nest Builder II</h2>
        <span className="mt-2 inline-flex rounded-full bg-lavender-100 px-3 py-1 font-display text-xs font-extrabold text-pebble">
          {earnedInLevel} / {xpToNextLevel} XP ({progress}%)
        </span>
        <p className="mx-auto mt-3 max-w-xs text-sm font-semibold text-pebble">
          Only {Math.max(0, xpToNextLevel - earnedInLevel)} XP until Level {level + 1}.
        </p>
      </div>
    </section>
  )
}
