import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { useAuth } from '../../features/auth/useAuth'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" className="h-5 w-5" aria-hidden="true">
      <rect fill="#F25022" height="9" width="9" x="1" y="1" />
      <rect fill="#7FBA00" height="9" width="9" x="11" y="1" />
      <rect fill="#00A4EF" height="9" width="9" x="1" y="11" />
      <rect fill="#FFB900" height="9" width="9" x="11" y="11" />
    </svg>
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading, error, signInWithPopup, signOut } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const from = (location.state as { from?: string } | null)?.from

  useEffect(() => {
    if (isLoading) return
    if (!user) return
    const destination = from && from !== '/auth' ? from : '/'
    navigate(destination, { replace: true })
  }, [isLoading, user, from, navigate])

  async function handleSignIn(provider: 'google' | 'microsoft') {
    setSigningIn(true)
    try {
      await signInWithPopup(provider)
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center overflow-hidden bg-cream px-6 py-10">
      <div className="absolute left-6 top-10 h-12 w-12 rounded-full bg-honey-100/70 blur-sm" />
      <div className="absolute right-4 top-32 h-24 w-24 rounded-full bg-mint-200/30 blur-xl" />
      <div className="absolute bottom-28 left-8 h-20 w-20 rounded-full bg-coral-100/70 blur-lg" />

      <section className="z-10 flex w-full flex-col items-center text-center">
        <div className="relative mb-5 grid h-44 w-44 place-items-center rounded-full bg-white p-3 shadow-soft">
          <div className="grid h-full w-full place-items-center rounded-full bg-lavender-100 text-7xl shadow-inner">
            🏡
          </div>
          <span className="absolute right-3 top-1 rounded-full bg-white p-1.5 text-xl shadow-card">💗</span>
        </div>
        <span className="mb-2 rounded-full bg-mint-200/60 px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-mint-700">
          Happy House Sharing
        </span>
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-coral-400">Homie</h1>
        <p className="mt-2 max-w-xs text-sm font-semibold leading-snug text-pebble">
          Where doing chores together feels cozy and fun.
        </p>
      </section>

      {user ? (
        <section className="z-10 mt-8 flex w-full flex-col items-center gap-4 rounded-4xl bg-white p-5 text-center shadow-card">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-mint-200 text-2xl">
            {user.displayName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-ink">Signed in as {user.displayName}</p>
            <p className="text-sm font-bold text-pebble">{user.email}</p>
          </div>
          <Button variant="mint" onClick={() => navigate(from && from !== '/auth' ? from : '/')} className="w-full">
            Continue
          </Button>
          <Button variant="ghost" onClick={signOut} className="w-full">
            Sign out
          </Button>
        </section>
      ) : (
        <section className="z-10 mt-8 flex w-full flex-col gap-3.5">
          <button
            type="button"
            disabled={signingIn}
            onClick={() => void handleSignIn('google')}
            className="flex h-[54px] w-full items-center justify-between rounded-full bg-white px-5 font-display text-sm font-extrabold text-ink shadow-[0_4px_0_#dee1f8,0_8px_18px_rgba(45,49,66,0.07)] transition-all active:translate-y-[3px] active:shadow-[0_1px_0_#dee1f8] disabled:opacity-60"
          >
            <span className="flex items-center gap-3"><GoogleIcon /> {signingIn ? 'Opening sign-in...' : 'Sign in with Google'}</span>
            <span>›</span>
          </button>
          <button
            type="button"
            disabled={signingIn}
            onClick={() => void handleSignIn('microsoft')}
            className="flex h-[54px] w-full items-center justify-between rounded-full bg-white px-5 font-display text-sm font-extrabold text-ink shadow-[0_4px_0_#dee1f8,0_8px_18px_rgba(45,49,66,0.07)] transition-all active:translate-y-[3px] active:shadow-[0_1px_0_#dee1f8] disabled:opacity-60"
          >
            <span className="flex items-center gap-3"><MicrosoftIcon /> {signingIn ? 'Opening sign-in...' : 'Sign in with Microsoft'}</span>
            <span>›</span>
          </button>
        </section>
      )}

      {error && (
        <p className="z-10 mt-5 w-full rounded-2xl bg-red-100 px-4 py-3 text-center text-xs font-bold text-red-700">
          {error}
        </p>
      )}

      <p className="z-10 mt-7 max-w-xs text-center text-xs font-semibold leading-relaxed text-pebble">
        SSO-only sign in with Google and Microsoft. Profile is created in Firestore on first login.
      </p>
    </main>
  )
}