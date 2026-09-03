import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { useAppMock } from '../mockState'

type Period = 'day' | 'week' | 'month'

const periodMultipliers: Record<Period, number> = { day: 0.22, week: 1, month: 3.7 }

export function LeaderboardPage() {
  const { members, householdName } = useAppMock()
  const [period, setPeriod] = useState<Period>('week')
  const ranked = useMemo(
    () =>
      [...members]
        .map((member) => ({ ...member, points: Math.round(member.points * periodMultipliers[period]) }))
        .sort((a, b) => b.points - a.points),
    [members, period],
  )
  const leader = ranked[0]

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">Household Hall of Fame</h1>
          <span className="rounded-full bg-mint-200 px-3 py-1 font-display text-xs font-extrabold text-mint-700">Active</span>
        </div>
        <p className="mt-1 text-sm font-bold text-pebble">{householdName} standings</p>
      </header>

      <section className="grid grid-cols-3 gap-1 rounded-full bg-lavender-100 p-1 shadow-inner">
        {(['day', 'week', 'month'] as Period[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setPeriod(value)}
            className={`rounded-full py-2 font-display text-xs font-extrabold capitalize transition-all ${
              period === value ? 'bg-coral-400 text-white shadow-[0_3px_0_rgba(115,23,9,0.18)]' : 'text-pebble'
            }`}
          >
            {value}
          </button>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-honey-100 via-honey-100/50 to-white p-5 shadow-[0_8px_24px_rgba(120,90,0,0.12),0_2px_0_#edd18c]">
        <div className="absolute -right-5 -top-5 text-8xl opacity-20">★</div>
        <div className="relative z-10 mb-3 flex items-center justify-between">
          <span className="rounded-full bg-honey-700 px-3 py-1 font-display text-xs font-extrabold uppercase tracking-wider text-white">
            {period} MVP
          </span>
          <span className="text-xs font-bold text-honey-700">Streak: {leader.streak} days</span>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <span className={`grid h-20 w-20 place-items-center rounded-full border-4 border-white ${leader.color} text-3xl shadow-card`}>
            {leader.initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="truncate font-display text-2xl font-extrabold text-ink">{leader.name}</h2>
              <span className="rounded-full bg-white px-3 py-1 font-display text-sm font-extrabold text-honey-700 shadow-card">
                {leader.points} pts
              </span>
            </div>
            <p className="text-sm font-bold text-pebble">{leader.title}</p>
            <span className="mt-2 inline-flex rounded-full bg-white/80 px-3 py-1 font-display text-[10px] font-extrabold text-honey-700 shadow-sm">
              Dishwashing Dynamo
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-display text-xs font-extrabold uppercase tracking-wider text-pebble">Rankings</span>
          <span className="text-xs font-bold text-pebble">Resets in 2d 8h</span>
        </div>
        {ranked.map((member, index) => {
          const progress = Math.round((member.points / leader.points) * 100)
          const isYou = member.id === 'maya'
          return (
            <article
              key={member.id}
              className={`relative overflow-hidden rounded-3xl p-4 shadow-card ${isYou ? 'bg-lavender-100 ring-2 ring-coral-200' : 'bg-white'}`}
            >
              {isYou && <span className="absolute right-0 top-0 rounded-bl-2xl bg-coral-400 px-3 py-0.5 font-display text-[10px] font-extrabold uppercase text-white">You</span>}
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-honey-100 font-display text-xs font-extrabold text-honey-700">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <span className={`grid h-11 w-11 place-items-center rounded-full ${member.color} font-display text-sm font-extrabold text-ink`}>
                  {member.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`truncate font-display text-sm font-extrabold ${isYou ? 'text-coral-700' : 'text-ink'}`}>{member.name}{isYou ? ' (You)' : ''}</span>
                    <span className="rounded-full bg-honey-100 px-2 py-0.5 font-display text-xs font-extrabold text-honey-700">
                      {member.points} pts
                    </span>
                  </div>
                  <p className="truncate text-xs font-bold text-pebble">{member.title}</p>
                </div>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-coral-400" style={{ width: `${progress}%` }} />
              </div>
            </article>
          )
        })}
      </section>

      <section className="flex items-center gap-3 rounded-4xl bg-gradient-to-r from-coral-100 to-honey-100 p-4 shadow-card">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow-card">🍕</span>
        <div className="min-w-0 flex-1">
          <span className="font-display text-xs font-extrabold uppercase tracking-wider text-coral-700">Weekly Bounty</span>
          <p className="text-sm font-extrabold text-ink">Winner picks pizza toppings this Sunday.</p>
        </div>
        <Button variant="secondary" className="min-h-9 px-3 text-xs">Cheer</Button>
      </section>
    </div>
  )
}
