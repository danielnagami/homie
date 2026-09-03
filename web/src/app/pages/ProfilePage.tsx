import { Link } from 'react-router-dom'
import { AvatarPreview } from '../../features/avatar/AvatarPreview'
import { AchievementsGallery } from '../../features/gamification/AchievementsGallery'
import { LevelBadge } from '../../features/gamification/LevelBadge'
import { StreakBadge } from '../../features/gamification/StreakBadge'
import { useAppMock } from '../mockState'

export function ProfilePage() {
  const { avatarConfig, members, tasks } = useAppMock()
  const maya = members[0]
  const completed = tasks.filter((task) => task.completedBy === 'Maya').length

  return (
    <div className="space-y-5">
      <section className="flex items-center gap-4 rounded-4xl bg-white p-4 shadow-card">
        <div className="rounded-full bg-coral-100 p-1 shadow-card">
          <AvatarPreview config={avatarConfig} size={86} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-mint-100 px-3 py-1 font-display text-[10px] font-extrabold uppercase text-mint-700">Mock Profile</span>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Maya</h1>
          <p className="text-sm font-bold text-pebble">{maya.title} · {maya.points} pts</p>
          <Link to="/avatar" className="mt-2 inline-flex font-display text-xs font-extrabold text-coral-400">
            Customize avatar
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <StreakBadge current={maya.streak} longest={12} />
        <section className="rounded-3xl bg-mint-100 p-4 shadow-card">
          <span className="font-display text-sm font-extrabold uppercase tracking-wider text-mint-700">Task wins</span>
          <p className="mt-2 font-display text-3xl font-extrabold text-ink">{completed}</p>
          <p className="text-xs font-bold text-pebble">Claimed in this prototype</p>
        </section>
      </div>

      <LevelBadge level={maya.level} xp={780} xpToNextLevel={1000} />

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-display text-xl font-extrabold text-ink">Level & Achievements</h2>
          <span className="font-display text-xs font-extrabold text-pebble">4 unlocked</span>
        </div>
        <AchievementsGallery />
      </section>
    </div>
  )
}
