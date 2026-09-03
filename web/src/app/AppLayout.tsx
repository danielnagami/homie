import { Link, Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { useAvatar } from '../features/avatar/useAvatar'
import {
  initialMembers,
  initialTasks,
  type AppMockContext,
  type MockTask,
} from './mockState'

export function AppLayout() {
  const [tasks, setTasks] = useState(initialTasks)
  const [householdName, setHouseholdName] = useState('Peach Blossom Cottage')
  const { avatarConfig, saving: avatarSaving, setAvatarConfig, saveAvatar } = useAvatar()

  const context = useMemo<AppMockContext>(
    () => ({
      avatarConfig,
      setAvatarConfig,
      saveAvatar,
      avatarSaving,
      householdName,
      setHouseholdName,
      joinCode: 'HM-402',
      members: initialMembers,
      tasks,
      toggleTask: (id) => {
        setTasks((current) =>
          current.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed, completedBy: task.completed ? undefined : 'Maya' }
              : task,
          ),
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
    [avatarConfig, avatarSaving, householdName, saveAvatar, setAvatarConfig, tasks],
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
    </div>
  )
}
