import { useState } from 'react'
import type { Achievement } from '../../types/models'

interface AchievementsGalleryProps {
  achievements: Achievement[]
  unlockedIds: Set<string>
}

export function AchievementsGallery({ achievements, unlockedIds }: AchievementsGalleryProps) {
  const [selectedId, setSelectedId] = useState(achievements[0]?.id ?? '')
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const visible = achievements.filter((achievement) =>
    filter === 'all' ? true : filter === 'unlocked' ? unlockedIds.has(achievement.id) : !unlockedIds.has(achievement.id),
  )
  const selected = achievements.find((achievement) => achievement.id === selectedId) ?? achievements[0]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'unlocked', 'locked'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 font-display text-xs font-extrabold capitalize shadow-card transition-all active:scale-95 ${
                filter === value ? 'bg-coral-400 text-white' : 'bg-white text-pebble'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-pebble">Tap to view</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visible.map((achievement) => {
          const unlocked = unlockedIds.has(achievement.id)
          return (
            <button
              key={achievement.id}
              type="button"
              onClick={() => setSelectedId(achievement.id)}
              className={`flex min-h-44 flex-col justify-between rounded-4xl p-3 text-left shadow-card transition-all active:scale-95 ${
                selectedId === achievement.id ? 'bg-white ring-2 ring-coral-300' : unlocked ? 'bg-white' : 'bg-lavender-100 opacity-85'
              }`}
            >
              <div className="text-center">
                <div className={`mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full text-2xl shadow-card ${unlocked ? 'bg-mint-200' : 'bg-lavender-300'}`}>
                  {achievement.icon}
                </div>
                <h3 className="font-display text-sm font-extrabold text-ink">{achievement.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-pebble">{achievement.description}</p>
              </div>
              <span className={`rounded-full py-1 text-center font-display text-[10px] font-extrabold ${unlocked ? 'bg-mint-100 text-mint-700' : 'bg-white text-pebble'}`}>
                {unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </button>
          )
        })}
      </div>

      {selected && (
        <article className="rounded-4xl bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-honey-100 text-2xl shadow-sm">{selected.icon}</span>
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink">{selected.title}</h2>
              <p className="text-xs font-bold text-pebble">{unlockedIds.has(selected.id) ? 'Unlocked' : 'Locked'}</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-pebble">{selected.description}</p>
        </article>
      )}
    </section>
  )
}