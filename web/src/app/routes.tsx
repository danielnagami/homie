import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { AuthPage } from './pages/AuthPage'
import { AvatarPage } from './pages/AvatarPage'
import { HouseholdPage } from './pages/HouseholdPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { TodayPage } from './pages/TodayPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <TodayPage /> },
      { path: '/leaderboard', element: <LeaderboardPage /> },
      { path: '/household', element: <HouseholdPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/avatar', element: <AvatarPage /> },
    ],
  },
  { path: '/auth', element: <AuthPage /> },
])
