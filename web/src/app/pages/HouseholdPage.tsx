import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { useAppMock } from '../mockState'

const names = [
  'Peach Blossom Cottage',
  'Honey Waffle Loft',
  'The Cozy Nook, Apt 4B',
  'Sunny Sprout Manor',
  'Cloudberry Villa',
]

export function HouseholdPage() {
  const navigate = useNavigate()
  const { householdName, setHouseholdName, joinCode, members } = useAppMock()
  const [name, setName] = useState(householdName)
  const [code, setCode] = useState('HM402')
  const [message, setMessage] = useState('Changes stay local in this task 4 prototype.')

  function createHome() {
    setHouseholdName(name.trim() || 'Peach Blossom Cottage')
    setMessage(`Created ${name || 'Peach Blossom Cottage'} locally. Next: avatar setup.`)
    window.setTimeout(() => navigate('/avatar'), 300)
  }

  function joinHome() {
    setHouseholdName('Peach Blossom Cottage')
    setMessage(`Joined with code ${code || joinCode}. Welcome to the crew.`)
    window.setTimeout(() => navigate('/'), 300)
  }

  return (
    <div className="space-y-5">
      <header className="text-center">
        <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-mint-200 text-3xl shadow-card">
          🏡
          <span className="absolute -right-1 -top-1 rounded-full bg-coral-400 px-1.5 py-1 text-xs text-white">♥</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-ink">Welcome to the Crew</h1>
        <p className="mx-auto mt-1 max-w-xs text-sm font-semibold text-pebble">
          Set up your cozy household space in seconds.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-4xl bg-white p-5 shadow-card">
        <span className="absolute inset-x-0 top-0 h-1.5 bg-coral-300" />
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-100 text-2xl">🏠</span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">Create a new Home</h2>
            <p className="text-xs font-bold text-pebble">Be the nest builder and invite your crew</p>
          </div>
        </div>
        <label className="block">
          <span className="mb-2 flex items-center justify-between px-1 font-display text-xs font-extrabold uppercase tracking-wider text-pebble">
            Home Nickname <span className="text-coral-400">Sweet & Cozy</span>
          </span>
          <div className="relative">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 w-full rounded-2xl border border-outline bg-cream px-4 pr-11 text-sm font-bold text-ink outline-none transition focus:border-coral-400 focus:ring-4 focus:ring-coral-100"
              placeholder="e.g. Peach Blossom Cottage"
            />
            <button
              type="button"
              onClick={() => setName(names[Math.floor(Math.random() * names.length)])}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-coral-100 shadow-sm"
            >
              🎲
            </button>
          </div>
        </label>
        <Button onClick={createHome} className="mt-4 w-full">
          Create Home
        </Button>
      </section>

      <div className="flex justify-center">
        <span className="rounded-full bg-lavender-300 px-4 py-1 font-display text-xs font-extrabold uppercase tracking-wider text-pebble shadow-card">
          or join existing
        </span>
      </div>

      <section className="relative overflow-hidden rounded-4xl bg-white p-5 shadow-card">
        <span className="absolute inset-x-0 top-0 h-1.5 bg-mint-200" />
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-200 text-2xl">✉️</span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">Join an Existing Home</h2>
            <p className="text-xs font-bold text-pebble">Step right in with a roommate pass</p>
          </div>
        </div>
        <label className="block">
          <span className="mb-2 flex items-center justify-between px-1 font-display text-xs font-extrabold uppercase tracking-wider text-pebble">
            Invite code <span className="text-mint-600">6-Digit Pin</span>
          </span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 6))}
            className="h-12 w-full rounded-2xl border border-outline bg-cream px-4 text-center font-display text-xl font-extrabold uppercase tracking-[0.4em] text-ink outline-none transition focus:border-mint-600 focus:ring-4 focus:ring-mint-100"
          />
        </label>
        <Button variant="mint" onClick={joinHome} className="mt-4 w-full">
          Join the Family
        </Button>
      </section>

      <section className="rounded-3xl bg-lavender-100 p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">Current mock home</h2>
          <span className="rounded-full bg-white px-3 py-1 font-display text-xs font-extrabold text-coral-400">{joinCode}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {members.map((member) => (
            <div key={member.id} className="rounded-2xl bg-white p-3 shadow-sm">
              <span className={`mb-2 grid h-9 w-9 place-items-center rounded-full ${member.color} font-display text-xs font-extrabold text-ink`}>
                {member.initials}
              </span>
              <p className="font-display text-sm font-extrabold text-ink">{member.name}</p>
              <p className="text-[11px] font-bold text-pebble">Lvl {member.level} · {member.streak}d streak</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs font-bold text-pebble">{message}</p>
      </section>
    </div>
  )
}
