import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { useAuth } from '../../features/auth/useAuth'
import {
  defaultHomeLocation,
  homeLocations,
  type HomeLocation,
} from '../../features/household/homeLocations'
import { useHousehold } from '../../features/household/useHousehold'
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
  const { householdName, joinCode, members } = useAppMock()
  const { user } = useAuth()
  const { activeHousehold, households, error, createHousehold, joinHousehold, isLoading } =
    useHousehold()
  const [name, setName] = useState(householdName)
  const [homeLocation, setHomeLocation] = useState<HomeLocation>(defaultHomeLocation)
  const [code, setCode] = useState('HM402')
  const [message, setMessage] = useState(
    user
      ? 'Create or join a household to sync it to Firestore.'
      : 'Sign in to create or join a real household.',
  )

  async function createHome() {
    if (!user) {
      setMessage('Please sign in first to create a household.')
      navigate('/auth')
      return
    }
    const household = await createHousehold(name, homeLocation)
    if (household) {
      setMessage(`Created ${household.name} (${household.joinCode}). Welcome to the crew!`)
      window.setTimeout(() => navigate('/'), 400)
    }
  }

  async function joinHome() {
    if (!user) {
      setMessage('Please sign in first to join a household.')
      navigate('/auth')
      return
    }
    const household = await joinHousehold(code)
    if (household) {
      setMessage(`Joined ${household.name}. Welcome to the crew!`)
      window.setTimeout(() => navigate('/'), 400)
    }
  }

  // Signed-in users without a real household yet should never see the mock name/code as if it were theirs.
  const displayName = activeHousehold?.name ?? (user ? null : householdName)
  const displayCode = activeHousehold?.joinCode ?? (user ? null : joinCode)
  const displayMembers = activeHousehold ? households.length : user ? 0 : members.length

  return (
    <div className="space-y-5">
      <header className="text-center">
        <div className="bg-mint-200 shadow-card relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full text-3xl">
          🏡
          <span className="bg-coral-400 absolute -top-1 -right-1 rounded-full px-1.5 py-1 text-xs text-white">
            ♥
          </span>
        </div>
        <h1 className="font-display text-ink text-3xl font-extrabold">Welcome to the Crew</h1>
        <p className="text-pebble mx-auto mt-1 max-w-xs text-sm font-semibold">
          {user
            ? `Signed in as ${user.displayName}`
            : 'Set up your cozy household space in seconds.'}
        </p>
      </header>

      <section className="shadow-card relative overflow-hidden rounded-4xl bg-white p-5">
        <span className="bg-coral-300 absolute inset-x-0 top-0 h-1.5" />
        <div className="mb-4 flex items-center gap-3">
          <span className="bg-coral-100 grid h-12 w-12 place-items-center rounded-2xl text-2xl">
            🏠
          </span>
          <div>
            <h2 className="font-display text-ink text-xl font-extrabold">Create a new Home</h2>
            <p className="text-pebble text-xs font-bold">
              Be the nest builder and invite your crew
            </p>
          </div>
        </div>
        <label className="block">
          <span className="font-display text-pebble mb-2 flex items-center justify-between px-1 text-xs font-extrabold tracking-wider uppercase">
            Home Nickname <span className="text-coral-400">Sweet & Cozy</span>
          </span>
          <div className="relative">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border-outline bg-cream text-ink focus:border-coral-400 focus:ring-coral-100 h-12 w-full rounded-2xl border px-4 pr-11 text-sm font-bold transition outline-none focus:ring-4"
              placeholder="e.g. Peach Blossom Cottage"
            />
            <button
              type="button"
              onClick={() => setName(names[Math.floor(Math.random() * names.length)])}
              className="bg-coral-100 absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full shadow-sm"
            >
              🎲
            </button>
          </div>
        </label>
        <label className="mt-4 block">
          <span className="font-display text-pebble mb-2 block px-1 text-xs font-extrabold tracking-wider uppercase">
            Home location
          </span>
          <select
            value={homeLocation.timeZone}
            onChange={(event) => {
              const selected = homeLocations.find(
                (location) => location.timeZone === event.target.value,
              )
              if (selected) setHomeLocation(selected)
            }}
            className="border-outline bg-cream text-ink focus:border-coral-400 focus:ring-coral-100 h-12 w-full rounded-2xl border px-4 text-sm font-bold transition outline-none focus:ring-4"
          >
            {!homeLocations.some((location) => location.timeZone === homeLocation.timeZone) && (
              <option value={homeLocation.timeZone}>{homeLocation.label}</option>
            )}
            {homeLocations.map((location) => (
              <option key={location.timeZone} value={location.timeZone}>
                {location.label}
              </option>
            ))}
          </select>
          <span className="text-pebble mt-1 block px-1 text-[11px] font-bold">
            Daily, weekly, and monthly schedules follow this home’s time zone (
            {homeLocation.timeZone}).
          </span>
        </label>
        <Button onClick={createHome} disabled={isLoading} className="mt-4 w-full">
          {isLoading ? 'Working...' : 'Create Home'}
        </Button>
      </section>

      <div className="flex justify-center">
        <span className="bg-lavender-300 font-display text-pebble shadow-card rounded-full px-4 py-1 text-xs font-extrabold tracking-wider uppercase">
          or join existing
        </span>
      </div>

      <section className="shadow-card relative overflow-hidden rounded-4xl bg-white p-5">
        <span className="bg-mint-200 absolute inset-x-0 top-0 h-1.5" />
        <div className="mb-4 flex items-center gap-3">
          <span className="bg-mint-200 grid h-12 w-12 place-items-center rounded-2xl text-2xl">
            ✉️
          </span>
          <div>
            <h2 className="font-display text-ink text-xl font-extrabold">Join an Existing Home</h2>
            <p className="text-pebble text-xs font-bold">Step right in with a roommate pass</p>
          </div>
        </div>
        <label className="block">
          <span className="font-display text-pebble mb-2 flex items-center justify-between px-1 text-xs font-extrabold tracking-wider uppercase">
            Invite code <span className="text-mint-600">6-Digit Pin</span>
          </span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 6))}
            className="border-outline bg-cream font-display text-ink focus:border-mint-600 focus:ring-mint-100 h-12 w-full rounded-2xl border px-4 text-center text-xl font-extrabold tracking-[0.4em] uppercase transition outline-none focus:ring-4"
          />
        </label>
        <Button variant="mint" onClick={joinHome} disabled={isLoading} className="mt-4 w-full">
          {isLoading ? 'Working...' : 'Join the Family'}
        </Button>
      </section>

      {error && (
        <p className="rounded-2xl bg-red-100 px-4 py-3 text-center text-xs font-bold text-red-700">
          {error}
        </p>
      )}

      <section className="bg-lavender-100 shadow-card rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-ink text-lg font-extrabold">Current home</h2>
          <span className="font-display text-coral-400 rounded-full bg-white px-3 py-1 text-xs font-extrabold">
            {displayCode ?? 'No code yet'}
          </span>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="font-display text-ink text-sm font-extrabold">
            {displayName ?? 'No household yet'}
          </p>
          <p className="text-pebble text-[11px] font-bold">
            {displayName
              ? `${displayMembers} member${displayMembers === 1 ? '' : 's'} · ${user ? 'synced to Firestore' : 'mock preview'}`
              : 'Create or join a home above to get started.'}
          </p>
          {activeHousehold && (
            <p className="text-pebble mt-1 text-[11px] font-bold">
              {activeHousehold.location} · {activeHousehold.timeZone}
            </p>
          )}
        </div>
        <p className="text-pebble mt-3 text-xs font-bold">{message}</p>
      </section>
    </div>
  )
}
