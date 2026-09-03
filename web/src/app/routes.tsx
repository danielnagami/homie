import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { AppLayout } from './AppLayout'
import { AuthPage } from './pages/AuthPage'
import { AvatarPage } from './pages/AvatarPage'
import { HouseholdPage } from './pages/HouseholdPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { ManageTasksPage } from './pages/ManageTasksPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProfilePage } from './pages/ProfilePage'
import { TodayPage } from './pages/TodayPage'

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <TodayPage /> },
          { path: '/leaderboard', element: <LeaderboardPage /> },
          { path: '/household', element: <HouseholdPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/rewards', element: <ProfilePage /> },
          { path: '/avatar', element: <AvatarPage /> },
          { path: '/tasks', element: <ManageTasksPage /> },
        ],
      },
    ],
  },
])
