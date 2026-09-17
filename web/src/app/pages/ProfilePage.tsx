import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { AvatarPreview } from '../../features/avatar/AvatarPreview'
import { AchievementsGallery } from '../../features/gamification/AchievementsGallery'
import { LevelBadge } from '../../features/gamification/LevelBadge'
import { StreakBadge } from '../../features/gamification/StreakBadge'
import { useAchievements } from '../../features/gamification/useAchievements'
import { useAuth } from '../../features/auth/useAuth'
import { useHousehold } from '../../features/household/useHousehold'
import { useAppMock } from '../mockState'

export function ProfilePage() {
  const { avatarConfig, members } = useAppMock()
  const { user, signOut } = useAuth()
  const { currentMember, activeHousehold } = useHousehold()
  const householdId = user ? activeHousehold?.id ?? null : null
  const { achievements, unlockedIds } = useAchievements(householdId, user?.uid ?? null)
  const maya = members[0]

  const isLive = Boolean(user && currentMember)
  const avatar = currentMember?.avatarConfig ?? avatarConfig
  const displayName = currentMember?.displayName || user?.displayName || maya.name
  const lifetimePoints = currentMember?.totals?.lifetimePoints ?? maya.points
  const streakCurrent = currentMember?.streak?.current ?? maya.streak
  const streakLongest = currentMember?.streak?.longest ?? 12
  const level = currentMember?.level?.level ?? maya.level
  const xp = currentMember?.level?.xp ?? lifetimePoints
  const xpIntoLevel = currentMember?.level?.xpIntoLevel
  const xpToNextLevel = currentMember?.level?.xpToNextLevel ?? 1000

  return (
    <div className="space-y-5">
      <section className="flex items-center gap-4 rounded-4xl bg-white p-4 shadow-card">
        <div className="rounded-full bg-coral-100 p-1 shadow-card">
          <AvatarPreview config={avatar} size={86} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-mint-100 px-3 py-1 font-display text-[10px] font-extrabold uppercase text-mint-700">
            {isLive ? 'Profile' : 'Mock Profile'}
          </span>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">{displayName}</h1>
          <p className="text-sm font-bold text-pebble">{maya.title} · {lifetimePoints} pts</p>
          <Link to="/avatar" className="mt-2 inline-flex font-display text-xs font-extrabold text-coral-400">
            Customize avatar
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <StreakBadge current={streakCurrent} longest={streakLongest} />
        <section className="rounded-3xl bg-mint-100 p-4 shadow-card">
          <span className="font-display text-sm font-extrabold uppercase tracking-wider text-mint-700">Lifetime XP</span>
          <p className="mt-2 font-display text-3xl font-extrabold text-ink">{lifetimePoints}</p>
          <p className="text-xs font-bold text-pebble">{isLive ? 'synced from scoring engine' : 'prototype value'}</p>
        </section>
      </div>

      <LevelBadge level={level} xp={xp} xpIntoLevel={xpIntoLevel} xpToNextLevel={xpToNextLevel} />

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-display text-xl font-extrabold text-ink">Level & Achievements</h2>
          <span className="font-display text-xs font-extrabold text-pebble">{unlockedIds.size} unlocked</span>
        </div>
        <AchievementsGallery achievements={achievements} unlockedIds={unlockedIds} />
      </section>

      <Button variant="ghost" onClick={() => void signOut()} className="w-full">
        Sign out
      </Button>
    </div>
  )
}
