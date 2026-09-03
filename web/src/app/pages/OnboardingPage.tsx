import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { AvatarBuilder } from '../../features/avatar/AvatarBuilder'
import { AvatarPreview } from '../../features/avatar/AvatarPreview'
import { useAuth } from '../../features/auth/useAuth'
import { useAvatar } from '../../features/avatar/useAvatar'
import { useHousehold } from '../../features/household/useHousehold'
import { useOnboarding } from '../../features/onboarding/useOnboarding'

const homeNames = [
  'Peach Blossom Cottage',
  'Honey Waffle Loft',
  'The Cozy Nook, Apt 4B',
  'Sunny Sprout Manor',
  'Cloudberry Villa',
]

const steps = ['Avatar', 'Name', 'Home']

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { avatarConfig, setAvatarConfig, saveAvatar, saving: avatarSaving } = useAvatar()
  const { displayName: savedName, saveDisplayName, completeOnboarding, error: onboardingError } = useOnboarding(
    user?.uid,
  )
  const { error: householdError, createHousehold, joinHousehold, isLoading: householdWorking } = useHousehold()

  const [step, setStep] = useState(0)
  const [name, setName] = useState(user?.displayName ?? '')
  const [homeName, setHomeName] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

  const resolvedName = name.trim() || savedName

  async function next() {
    if (step === 0) {
      const saved = await saveAvatar(avatarConfig)
      if (!saved) return
    } else if (step === 1) {
      if (!resolvedName) {
        setMessage('Give yourself a display name first.')
        return
      }
      const saved = await saveDisplayName(resolvedName)
      if (!saved) return
    }
    setMessage('')
    setStep((current) => Math.min(steps.length - 1, current + 1))
  }

  function back() {
    setMessage('')
    setStep((current) => Math.max(0, current - 1))
  }

  async function finish() {
    const completed = await completeOnboarding()
    if (completed) navigate('/', { replace: true })
  }

  async function createHome() {
    if (!homeName.trim()) {
      setMessage('Name your home first.')
      return
    }
    const household = await createHousehold(homeName)
    if (!household) return
    setMessage(`Created ${household.name} (${household.joinCode}).`)
    await finish()
  }

  async function joinHome() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setMessage('Enter the invite code.')
      return
    }
    const household = await joinHousehold(trimmed)
    if (!household) return
    setMessage(`Joined ${household.name}.`)
    await finish()
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-cream px-5 pb-10 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-full bg-white px-4 py-2 font-display text-xs font-extrabold text-pebble shadow-card transition-all active:scale-95 disabled:opacity-40"
        >
          ← Back
        </button>
        <span className="rounded-full bg-lavender-200 px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-pebble">
          Step {step + 1} of {steps.length}
        </span>
      </div>

      <div className="mb-5 flex items-center justify-center gap-2">
        {steps.map((label, index) => (
          <span key={label} className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                index === step ? 'bg-coral-400 text-white shadow-card' : 'bg-white text-pebble'
              }`}
            >
              {label}
            </span>
            {index < steps.length - 1 && <span className="text-pebble">›</span>}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <AvatarBuilder value={avatarConfig} onChange={setAvatarConfig} stepLabel="Step 1 of 3" />
          <Button className="w-full" disabled={avatarSaving} onClick={() => void next()}>
            {avatarSaving ? 'Saving...' : 'That\'s me — Continue'}
          </Button>
        </div>
      )}

      {step === 1 && (
        <section className="space-y-5">
          <header className="text-center">
            <div className="mx-auto mb-3 w-fit rounded-full bg-white p-2 shadow-card">
              <AvatarPreview config={avatarConfig} size={96} />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink">What should we call you?</h1>
            <p className="mx-auto mt-1 max-w-xs text-sm font-semibold text-pebble">
              Your roommates will see this name in the app.
            </p>
          </header>
          <label className="block">
            <span className="mb-2 flex items-center justify-between px-1 font-display text-xs font-extrabold uppercase tracking-wider text-pebble">
              Display name <span className="text-mint-600">{name.length}/24</span>
            </span>
            <input
              value={name}
              maxLength={24}
              onChange={(event) => setName(event.target.value)}
              className="h-12 w-full rounded-2xl border border-outline bg-white px-4 text-sm font-bold text-ink outline-none transition focus:border-coral-400 focus:ring-4 focus:ring-coral-100"
              placeholder="e.g. Sunny Sam"
            />
          </label>
          <Button className="w-full" onClick={() => void next()}>
            Save & Continue
          </Button>
        </section>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <header className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-ink">Set up your home</h1>
            <p className="mx-auto mt-1 max-w-xs text-sm font-semibold text-pebble">
              Create a household or join one with an invite code.
            </p>
          </header>

<section className="relative rounded-4xl bg-white p-5 shadow-card">
          <span className="absolute inset-x-0 top-0 h-1.5 bg-coral-300" />
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-100 text-2xl">🏠</span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-ink">Create a new Home</h2>
                <p className="text-xs font-bold text-pebble">Be the nest builder and invite your crew</p>
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block px-1 font-display text-xs font-extrabold uppercase tracking-wider text-pebble">
                Home Nickname
              </span>
              <div className="relative">
                <input
                  value={homeName}
                  onChange={(event) => setHomeName(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-outline bg-cream px-4 pr-11 text-sm font-bold text-ink outline-none transition focus:border-coral-400 focus:ring-4 focus:ring-coral-100"
                  placeholder="e.g. Peach Blossom Cottage"
                />
                <button
                  type="button"
                  onClick={() => setHomeName(homeNames[Math.floor(Math.random() * homeNames.length)])}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-coral-100 shadow-sm"
                >
                  🎲
                </button>
              </div>
            </label>
            <Button onClick={() => void createHome()} disabled={householdWorking} className="mt-4 w-full">
              {householdWorking ? 'Working...' : 'Create Home'}
            </Button>
          </section>

          <div className="flex justify-center">
            <span className="rounded-full bg-lavender-300 px-4 py-1 font-display text-xs font-extrabold uppercase tracking-wider text-pebble shadow-card">
              or join existing
            </span>
          </div>

          <section className="rounded-4xl bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-200 text-2xl">✉️</span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-ink">Join an Existing Home</h2>
                <p className="text-xs font-bold text-pebble">Step right in with a roommate pass</p>
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block px-1 font-display text-xs font-extrabold uppercase tracking-wider text-pebble">
                Invite code
              </span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 6))}
                className="h-12 w-full rounded-2xl border border-outline bg-cream px-4 text-center font-display text-xl font-extrabold uppercase tracking-[0.4em] text-ink outline-none transition focus:border-mint-600 focus:ring-4 focus:ring-mint-100"
              />
            </label>
            <Button variant="mint" onClick={() => void joinHome()} disabled={householdWorking} className="mt-4 w-full">
              {householdWorking ? 'Working...' : 'Join the Family'}
            </Button>
          </section>
        </div>
      )}

      {onboardingError && (
        <p className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-center text-xs font-bold text-red-700">
          {onboardingError}
        </p>
      )}
      {householdError && (
        <p className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-center text-xs font-bold text-red-700">
          {householdError}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-2xl bg-mint-100 px-4 py-3 text-center text-xs font-bold text-mint-700">{message}</p>
      )}
    </main>
  )
}