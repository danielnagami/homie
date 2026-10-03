import { useMemo } from 'react'
import { AvatarPreview } from '../../features/avatar/AvatarPreview'
import { useLeaderboard, type LeaderboardPeriod } from '../../features/leaderboard/useLeaderboard'
import { useAuth } from '../../features/auth/useAuth'
import { useHousehold } from '../../features/household/useHousehold'
import { useAppMock } from '../mockState'
import { shiftDateKey } from '../../lib/householdTime'

const periodMultipliers: Record<LeaderboardPeriod, number> = { day: 0.22, week: 1, month: 3.7 }

function formatDateKey(dateKey: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    // dateKey is already a calendar date in the household time zone. Format it
    // as UTC so converting the display instant cannot move it to an adjacent day.
    timeZone: 'UTC',
  }).format(new Date(`${dateKey}T00:00:00.000Z`))
}

export function LeaderboardPage() {
  const { members: mockMembers, householdName } = useAppMock()
  const { user } = useAuth()
  const { activeHousehold } = useHousehold()
  const householdId = user ? (activeHousehold?.id ?? null) : null

  const timeZone = activeHousehold?.timeZone ?? 'UTC'
  const leaderboard = useLeaderboard(householdId, timeZone)
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
          <h1 className="font-display text-ink text-3xl leading-tight font-extrabold">
            Household Hall of Fame
          </h1>
          <span className="bg-mint-200 font-display text-mint-700 rounded-full px-3 py-1 text-xs font-extrabold">
            Active
          </span>
        </div>
        <p className="text-pebble mt-1 text-sm font-bold">
          {householdName} standings · {householdId ? 'live' : 'mock'}
        </p>
      </header>

      <section className="bg-lavender-100 grid grid-cols-3 gap-1 rounded-full p-1 shadow-inner">
        {(['day', 'week', 'month'] as LeaderboardPeriod[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => leaderboard.setPeriod(value)}
            className={`font-display rounded-full py-2 text-xs font-extrabold capitalize transition-all ${
              period === value
                ? 'bg-coral-400 text-white shadow-[0_3px_0_rgba(115,23,9,0.18)]'
                : 'text-pebble'
            }`}
          >
            {value}
          </button>
        ))}
      </section>

      {period === 'day' && (
        <section className="shadow-card rounded-3xl bg-white p-3" aria-label="Daily ranking date">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                leaderboard.setSelectedDateKey(shiftDateKey(leaderboard.selectedDateKey, -1))
              }
              className="bg-lavender-100 font-display text-ink grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-extrabold transition active:scale-95"
              aria-label="Previous day"
            >
              ←
            </button>
            <label className="min-w-0 flex-1 text-center">
              <span className="font-display text-ink block truncate text-sm font-extrabold">
                {isToday ? 'Today' : formatDateKey(leaderboard.selectedDateKey)}
              </span>
              <input
                type="date"
                value={leaderboard.selectedDateKey}
                max={leaderboard.todayDateKey}
                onChange={(event) => leaderboard.setSelectedDateKey(event.target.value)}
                className="text-pebble mt-1 max-w-full bg-transparent text-center text-xs font-bold"
                aria-label="Choose a past ranking date"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                leaderboard.setSelectedDateKey(shiftDateKey(leaderboard.selectedDateKey, 1))
              }
              disabled={isToday}
              className="bg-lavender-100 font-display text-ink grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-extrabold transition enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next day"
            >
              →
            </button>
          </div>
        </section>
      )}

      {leaderboard.isLoading ? (
        <p className="text-pebble text-center text-sm font-bold">Loading rankings...</p>
      ) : !hasActivity ? (
        <section className="shadow-card rounded-4xl bg-white p-6 text-center">
          <p className="font-display text-ink text-xl font-extrabold">No rankings yet</p>
          <p className="text-pebble mt-2 text-sm font-bold">
            No completed tasks were recorded for this {period === 'day' ? 'day' : period}.
          </p>
        </section>
      ) : (
        <>
          <section className="from-honey-100 via-honey-100/50 relative overflow-hidden rounded-4xl bg-gradient-to-br to-white p-5 shadow-[0_8px_24px_rgba(120,90,0,0.12),0_2px_0_#edd18c]">
            <div className="absolute -top-5 -right-5 text-8xl opacity-20">★</div>
            <div className="relative z-10 mb-3 flex items-center justify-between">
              <span className="bg-honey-700 font-display rounded-full px-3 py-1 text-xs font-extrabold tracking-wider text-white uppercase">
                {period} MVP
              </span>
              <span className="text-honey-700 text-xs font-bold">
                Streak: {leader?.streak ?? 0} days
              </span>
            </div>
            {leader && (
              <div className="relative z-10 flex items-center gap-4">
                {leader.avatarConfig ? (
                  <div className="shadow-card rounded-full border-4 border-white">
                    <AvatarPreview config={leader.avatarConfig} size={80} />
                  </div>
                ) : (
                  <span className="bg-honey-100 font-display text-honey-700 shadow-card grid h-20 w-20 place-items-center rounded-full border-4 border-white text-3xl font-extrabold">
                    {leader.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-ink truncate text-2xl font-extrabold">
                      {leader.name}
                    </h2>
                    <span className="font-display text-honey-700 shadow-card rounded-full bg-white px-3 py-1 text-sm font-extrabold">
                      {leader.points} pts
                    </span>
                  </div>
                  <p className="text-pebble text-sm font-bold">Household Legend</p>
                  <span className="font-display text-honey-700 mt-2 inline-flex rounded-full bg-white/80 px-3 py-1 text-[10px] font-extrabold shadow-sm">
                    Dishwashing Dynamo
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-display text-pebble text-xs font-extrabold tracking-wider uppercase">
                Rankings
              </span>
              <span className="text-pebble text-xs font-bold">
                {period === 'day'
                  ? isToday
                    ? 'Today'
                    : formatDateKey(leaderboard.selectedDateKey)
                  : `Current ${period}`}
              </span>
            </div>
            {ranked.map((member, index) => {
              const progress = leader?.points
                ? Math.round((member.points / leader.points) * 100)
                : 0
              const isYou = householdId ? member.uid === user?.uid : member.uid === 'maya'
              return (
                <article
                  key={member.uid}
                  className={`shadow-card relative overflow-hidden rounded-3xl p-4 ${isYou ? 'bg-lavender-100 ring-coral-200 ring-2' : 'bg-white'}`}
                >
                  {isYou && (
                    <span className="bg-coral-400 font-display absolute top-0 right-0 rounded-bl-2xl px-3 py-0.5 text-[10px] font-extrabold text-white uppercase">
                      You
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="bg-honey-100 font-display text-honey-700 grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold">
                      {index === 0
                        ? '🥇'
                        : index === 1
                          ? '🥈'
                          : index === 2
                            ? '🥉'
                            : `#${index + 1}`}
                    </span>
                    {member.avatarConfig ? (
                      <span className="border-lavender-300 grid h-11 w-11 place-items-center rounded-full border-2">
                        <AvatarPreview config={member.avatarConfig} size={44} />
                      </span>
                    ) : (
                      <span className="bg-honey-100 font-display text-honey-700 grid h-11 w-11 place-items-center rounded-full text-sm font-extrabold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-display truncate text-sm font-extrabold ${isYou ? 'text-coral-700' : 'text-ink'}`}
                        >
                          {member.name}
                          {isYou ? ' (You)' : ''}
                        </span>
                        <span className="bg-honey-100 font-display text-honey-700 rounded-full px-2 py-0.5 text-xs font-extrabold">
                          {member.points} pts
                        </span>
                      </div>
                      <p className="text-pebble truncate text-xs font-bold">
                        Streak {member.streak} days
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/80">
                    <div
                      className="bg-coral-400 h-full rounded-full"
                      style={{ width: `${progress}%` }}
                    />
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
