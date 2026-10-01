import { useMemo } from 'react'
import { AvatarPreview } from '../../features/avatar/AvatarPreview'
import { useLeaderboard, type LeaderboardPeriod } from '../../features/leaderboard/useLeaderboard'
import { useAuth } from '../../features/auth/useAuth'
import { useHousehold } from '../../features/household/useHousehold'
import { useAppMock } from '../mockState'

const periodMultipliers: Record<LeaderboardPeriod, number> = { day: 0.22, week: 1, month: 3.7 }

function shiftDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatDateKey(dateKey: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateKey}T00:00:00.000Z`))
}

export function LeaderboardPage() {
  const { members: mockMembers, householdName } = useAppMock()
  const { user } = useAuth()
  const { activeHousehold } = useHousehold()
  const householdId = user ? activeHousehold?.id ?? null : null

  const leaderboard = useLeaderboard(householdId)
  const period = leaderboard.period
  const isToday = leaderboard.selectedDateKey === leaderboard.todayDateKey
  const hasActivity = householdId ? leaderboard.hasActivity : true

  const ranked = useMemo(() => {
    const liveEntries = leaderboard.entries
    if (householdId) return liveEntries

    return mockMembers
      .map((member) => ({
        uid: member.id,
        name: member.name,
        streak: member.streak,
        displayName: member.name,
        points: Math.round(member.points * periodMultipliers[period]),
        avatarConfig: null,
      }))
      .sort((a, b) => b.points - a.points)
  }, [householdId, leaderboard.entries, mockMembers, period])

  const leader = ranked[0]

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">Household Hall of Fame</h1>
          <span className="rounded-full bg-mint-200 px-3 py-1 font-display text-xs font-extrabold text-mint-700">Active</span>
        </div>
        <p className="mt-1 text-sm font-bold text-pebble">
          {householdName} standings · {householdId ? 'live' : 'mock'}
        </p>
      </header>

      <section className="grid grid-cols-3 gap-1 rounded-full bg-lavender-100 p-1 shadow-inner">
        {(['day', 'week', 'month'] as LeaderboardPeriod[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => leaderboard.setPeriod(value)}
            className={`rounded-full py-2 font-display text-xs font-extrabold capitalize transition-all ${
              period === value ? 'bg-coral-400 text-white shadow-[0_3px_0_rgba(115,23,9,0.18)]' : 'text-pebble'
            }`}
          >
            {value}
          </button>
        ))}
      </section>

      {period === 'day' && (
        <section className="rounded-3xl bg-white p-3 shadow-card" aria-label="Daily ranking date">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => leaderboard.setSelectedDateKey(shiftDateKey(leaderboard.selectedDateKey, -1))}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lavender-100 font-display text-lg font-extrabold text-ink transition active:scale-95"
              aria-label="Previous day"
            >
              ←
            </button>
            <label className="min-w-0 flex-1 text-center">
              <span className="block truncate font-display text-sm font-extrabold text-ink">
                {isToday ? 'Today' : formatDateKey(leaderboard.selectedDateKey)}
              </span>
              <input
                type="date"
                value={leaderboard.selectedDateKey}
                max={leaderboard.todayDateKey}
                onChange={(event) => leaderboard.setSelectedDateKey(event.target.value)}
                className="mt-1 max-w-full bg-transparent text-center text-xs font-bold text-pebble"
                aria-label="Choose a past ranking date"
              />
            </label>
            <button
              type="button"
              onClick={() => leaderboard.setSelectedDateKey(shiftDateKey(leaderboard.selectedDateKey, 1))}
              disabled={isToday}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lavender-100 font-display text-lg font-extrabold text-ink transition enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next day"
            >
              →
            </button>
          </div>
        </section>
      )}

      {leaderboard.isLoading ? (
        <p className="text-center text-sm font-bold text-pebble">Loading rankings...</p>
      ) : !hasActivity ? (
        <section className="rounded-4xl bg-white p-6 text-center shadow-card">
          <p className="font-display text-xl font-extrabold text-ink">No rankings yet</p>
          <p className="mt-2 text-sm font-bold text-pebble">
            No completed tasks were recorded for this {period === 'day' ? 'day' : period}.
          </p>
        </section>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-honey-100 via-honey-100/50 to-white p-5 shadow-[0_8px_24px_rgba(120,90,0,0.12),0_2px_0_#edd18c]">
            <div className="absolute -right-5 -top-5 text-8xl opacity-20">★</div>
            <div className="relative z-10 mb-3 flex items-center justify-between">
              <span className="rounded-full bg-honey-700 px-3 py-1 font-display text-xs font-extrabold uppercase tracking-wider text-white">
                {period} MVP
              </span>
              <span className="text-xs font-bold text-honey-700">Streak: {leader?.streak ?? 0} days</span>
            </div>
            {leader && (
              <div className="relative z-10 flex items-center gap-4">
                {leader.avatarConfig ? (
                  <div className="rounded-full border-4 border-white shadow-card">
                    <AvatarPreview config={leader.avatarConfig} size={80} />
                  </div>
                ) : (
                  <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-honey-100 font-display text-3xl font-extrabold text-honey-700 shadow-card">
                    {leader.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate font-display text-2xl font-extrabold text-ink">{leader.name}</h2>
                    <span className="rounded-full bg-white px-3 py-1 font-display text-sm font-extrabold text-honey-700 shadow-card">
                      {leader.points} pts
                    </span>
                  </div>
                  <p className="text-sm font-bold text-pebble">Household Legend</p>
                  <span className="mt-2 inline-flex rounded-full bg-white/80 px-3 py-1 font-display text-[10px] font-extrabold text-honey-700 shadow-sm">
                    Dishwashing Dynamo
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-display text-xs font-extrabold uppercase tracking-wider text-pebble">Rankings</span>
              <span className="text-xs font-bold text-pebble">
                {period === 'day' ? (isToday ? 'Today' : formatDateKey(leaderboard.selectedDateKey)) : `Current ${period}`}
              </span>
            </div>
            {ranked.map((member, index) => {
              const progress = leader?.points ? Math.round((member.points / leader.points) * 100) : 0
              const isYou = householdId ? member.uid === user?.uid : member.uid === 'maya'
              return (
                <article
                  key={member.uid}
                  className={`relative overflow-hidden rounded-3xl p-4 shadow-card ${isYou ? 'bg-lavender-100 ring-2 ring-coral-200' : 'bg-white'}`}
                >
                  {isYou && <span className="absolute right-0 top-0 rounded-bl-2xl bg-coral-400 px-3 py-0.5 font-display text-[10px] font-extrabold uppercase text-white">You</span>}
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-honey-100 font-display text-xs font-extrabold text-honey-700">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    {member.avatarConfig ? (
                      <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-lavender-300">
                        <AvatarPreview config={member.avatarConfig} size={44} />
                      </span>
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-honey-100 font-display text-sm font-extrabold text-honey-700">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate font-display text-sm font-extrabold ${isYou ? 'text-coral-700' : 'text-ink'}`}>
                          {member.name}{isYou ? ' (You)' : ''}
                        </span>
                        <span className="rounded-full bg-honey-100 px-2 py-0.5 font-display text-xs font-extrabold text-honey-700">
                          {member.points} pts
                        </span>
                      </div>
                      <p className="truncate text-xs font-bold text-pebble">Streak {member.streak} days</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/80">
                    <div className="h-full rounded-full bg-coral-400" style={{ width: `${progress}%` }} />
                  </div>
                </article>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}
