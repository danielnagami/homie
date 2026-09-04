import { Link, Outlet } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { useAuth } from '../features/auth/useAuth'
import { useAvatar } from '../features/avatar/useAvatar'
import { useHousehold } from '../features/household/useHousehold'
import { useAchievements } from '../features/gamification/useAchievements'
import { UnlockToast } from '../features/gamification/UnlockToast'
import { useInstallPrompt } from '../features/pwa/useInstallPrompt'
import type { Achievement } from '../types/models'
import {
  initialMembers,
  initialTasks,
  type AppMockContext,
  type MockMember,
  type MockTask,
} from './mockState'

const memberColors = ['bg-coral-100', 'bg-honey-100', 'bg-mint-100', 'bg-lavender-200', 'bg-mint-200']

export function AppLayout() {
  const [tasks, setTasks] = useState(initialTasks)
  const [appHouseholdName, setAppHouseholdName] = useState('Peach Blossom Cottage')
  const { avatarConfig, saving: avatarSaving, setAvatarConfig, saveAvatar } = useAvatar()
  const { user } = useAuth()
  const { activeHousehold, members } = useHousehold()
  const householdId = user ? activeHousehold?.id ?? null : null
  const { achievements, unlockedIds } = useAchievements(householdId, user?.uid ?? null)
  const [latestUnlock, setLatestUnlock] = useState<Achievement | null>(null)
  const seenIds = useRef<Set<string>>(new Set())
  const { canInstall, promptInstall } = useInstallPrompt()

  useEffect(() => {
    if (unlockedIds.size === 0) return
    for (const id of unlockedIds) {
      if (!seenIds.current.has(id)) {
        seenIds.current.add(id)
        const achievement = achievements.find((item) => item.id === id)
        if (achievement) {
          const timer = window.setTimeout(() => setLatestUnlock(achievement), 0)
          return () => window.clearTimeout(timer)
        }
      }
    }
  }, [unlockedIds, achievements])

  const householdName = activeHousehold?.name ?? appHouseholdName
  const joinCode = activeHousehold?.joinCode ?? 'HM-402'

  const membersForContext = useMemo<MockMember[]>(() => {
    if (!activeHousehold || members.length === 0) {
      // Signed-in users without a household yet get neutral defaults, not the mocked seed data.
      if (user) {
        return [
          {
            id: user.uid,
            name: user.displayName || 'Homie friend',
            initials: (user.displayName || 'H').charAt(0).toUpperCase(),
            title: 'Roommate',
            points: 0,
            level: 1,
            streak: 0,
            color: memberColors[0],
          },
        ]
      }
      return initialMembers
    }
    return members.map((member, index) => ({
      id: member.id,
      name: member.displayName || 'Homie friend',
      initials: (member.displayName || 'H').charAt(0).toUpperCase(),
      title: 'Roommate',
      points: member.totals?.lifetimePoints ?? 0,
      level: member.level?.level ?? 1,
      streak: member.streak?.current ?? 0,
      color: memberColors[index % memberColors.length],
    }))
  }, [activeHousehold, members, user])

  const context = useMemo<AppMockContext>(
    () => ({
      avatarConfig,
      setAvatarConfig,
      saveAvatar,
      avatarSaving,
      householdName,
      setHouseholdName: setAppHouseholdName,
      joinCode,
      members: membersForContext,
      tasks,
      toggleTask: (id) => {
        setTasks((current) =>
          current.map((task) => {
            if (task.id !== id) return task
            if (task.repeatable) {
              return { ...task, completed: true, completedBy: 'Maya', completionCount: (task.completionCount ?? 0) + 1 }
            }
            return { ...task, completed: !task.completed, completedBy: task.completed ? undefined : 'Maya' }
          }),
        )
      },
      addTask: (draft) => {
        setTasks((current) => [
          {
            id: crypto.randomUUID(),
            title: draft.title,
            points: draft.points,
            recurrence: draft.recurrence,
            assignedTo: draft.assignedTo,
            assignee: draft.assignedTo || 'Anyone',
            active: true,
            createdBy: 'maya',
            repeatable: draft.repeatable,
            icon: draft.icon,
            room: draft.room,
            due: 'Freshly posted',
            category: 'cleaning',
            completed: false,
          } satisfies MockTask,
          ...current,
        ])
      },
      updateTask: (id, draft) => {
        setTasks((current) =>
          current.map((task) =>
            task.id === id
              ? {
                  ...task,
                  title: draft.title,
                  points: draft.points,
                  recurrence: draft.recurrence,
                  assignedTo: draft.assignedTo,
                  assignee: draft.assignedTo || 'Anyone',
                  repeatable: draft.repeatable,
                  icon: draft.icon,
                  room: draft.room,
                }
              : task,
          ),
        )
      },
      deleteTask: (id) => {
        setTasks((current) => current.filter((task) => task.id !== id))
      },
    }),
    [avatarConfig, avatarSaving, householdName, saveAvatar, setAvatarConfig, tasks, membersForContext, joinCode, setAppHouseholdName],
  )

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md overflow-hidden bg-cream shadow-[0_0_40px_rgba(45,49,66,0.08)]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-cream/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-extrabold text-coral-400">
            Homie
          </Link>
          <Link
            to="/household"
            className="rounded-full bg-white px-3 py-1.5 font-display text-xs font-extrabold text-pebble shadow-card"
          >
            {householdName}
          </Link>
        </div>
      </header>
      <main className="min-h-[calc(100dvh-4rem)] px-5 pb-28 pt-4">
        <Outlet context={context} />
      </main>
      <BottomNav />
      <UnlockToast achievement={latestUnlock} />
      {canInstall && (
        <button
          type="button"
          onClick={promptInstall}
          className="fixed bottom-24 left-5 z-40 rounded-full bg-white px-4 py-2 font-display text-xs font-extrabold text-coral-400 shadow-soft ring-2 ring-coral-300"
        >
          Install Homie
        </button>
      )}
    </div>
  )
}
