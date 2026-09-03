import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { useHousehold } from '../features/household/useHousehold'
import { useOnboarding } from '../features/onboarding/useOnboarding'

function Splash() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 bg-cream px-6">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-4xl shadow-soft">🏡</div>
      <p className="font-display text-sm font-extrabold text-pebble">Loading your cozy space...</p>
    </main>
  )
}

export function RequireAuth() {
  const location = useLocation()
  const { user, isLoading: authLoading } = useAuth()

  if (authLoading) return <Splash />
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />

  return <AuthGate key={user.uid} userUid={user.uid} />
}

function AuthGate({ userUid }: { userUid: string }) {
  const location = useLocation()
  const { activeHousehold, isLoading: householdLoading } = useHousehold()
  const { onboardingComplete, isLoading: onboardingLoading } = useOnboarding(userUid)

  if (onboardingLoading) return <Splash />
  if (onboardingComplete !== true) {
    if (location.pathname === '/onboarding') return <Outlet />
    return <Navigate to="/onboarding" replace />
  }

  if (householdLoading) return <Splash />
  if (!activeHousehold) {
    if (location.pathname === '/household') return <Outlet />
    return <Navigate to="/household" replace />
  }

  if (location.pathname === '/onboarding') return <Navigate to="/" replace />
  return <Outlet />
}