import { useState } from 'react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  reward: string
  unlocked: boolean
  progress?: string
  percent?: number
}

const achievements: Achievement[] = [
  { id: 'sink', title: 'Sparkling Sink', description: 'Washed dishes 10 days in a row', icon: '🧼', reward: '+150 XP bonus', unlocked: true },
  { id: 'plants', title: 'Green Thumb', description: 'Watered 25 house plants', icon: '🌿', reward: '+120 XP bonus', unlocked: true },
  { id: 'early', title: 'Early Bird', description: 'Chore done before 9 AM', icon: '☀️', reward: 'Dawn Dynamo flair', unlocked: true },
  { id: 'trash', title: 'Trash Ninja', description: 'Took out trash unasked', icon: '🥷', reward: 'Ninja headband', unlocked: true },
  { id: 'chef', title: 'Sunday Feast', description: 'Cook for everyone 5 times', icon: '🍳', reward: 'Golden apron', unlocked: false, progress: '2 / 5', percent: 40 },
  { id: 'streak', title: 'Streak Master', description: 'Reach a 14-day streak', icon: '🔥', reward: '+300 XP bonus', unlocked: false, progress: '5 / 14', percent: 35 },
  { id: 'legend', title: 'Cozy Legend', description: 'Reach Level 10', icon: '👑', reward: 'Golden crown', unlocked: false },
  { id: 'sweep', title: 'Clean Sweep', description: 'All tasks in one day', icon: '🧹', reward: '+250 XP bonus', unlocked: false },
]

export function AchievementsGallery() {
  const [selected, setSelected] = useState(achievements[0])
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const visible = achievements.filter((achievement) =>
    filter === 'all' ? true : filter === 'unlocked' ? achievement.unlocked : !achievement.unlocked,
  )

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
        {visible.map((achievement) => (
          <button
            key={achievement.id}
            type="button"
            onClick={() => setSelected(achievement)}
            className={`flex min-h-44 flex-col justify-between rounded-4xl p-3 text-left shadow-card transition-all active:scale-95 ${
              selected.id === achievement.id ? 'bg-white ring-2 ring-coral-300' : achievement.unlocked ? 'bg-white' : 'bg-lavender-100 opacity-85'
            }`}
          >
            <div className="text-center">
              <div className={`mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full text-2xl shadow-card ${achievement.unlocked ? 'bg-mint-200' : 'bg-lavender-300'}`}>
                {achievement.icon}
              </div>
              <h3 className="font-display text-sm font-extrabold text-ink">{achievement.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs font-semibold text-pebble">{achievement.description}</p>
            </div>
            {achievement.progress ? (
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-lavender-300">
                  <div className="h-full rounded-full bg-coral-400" style={{ width: `${achievement.percent}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] font-extrabold text-pebble">
                  <span>Progress</span>
                  <span className="text-coral-400">{achievement.progress}</span>
                </div>
              </div>
            ) : (
              <span className={`rounded-full py-1 text-center font-display text-[10px] font-extrabold ${achievement.unlocked ? 'bg-mint-100 text-mint-700' : 'bg-white text-pebble'}`}>
                {achievement.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            )}
          </button>
        ))}
      </div>

      <article className="rounded-4xl bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-honey-100 text-2xl shadow-sm">{selected.icon}</span>
          <div>
            <h2 className="font-display text-lg font-extrabold text-ink">{selected.title}</h2>
            <p className="text-xs font-bold text-pebble">{selected.reward}</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-pebble">{selected.description}</p>
      </article>
    </section>
  )
}
