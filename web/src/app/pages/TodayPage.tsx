import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../../components/Modal'
import { AvatarPreview } from '../../features/avatar/AvatarPreview'
import { CreateTaskForm } from '../../features/tasks/CreateTaskForm'
import { TaskList } from '../../features/tasks/TaskList'
import { useTaskCompletions } from '../../features/tasks/useTaskCompletions'
import { useTasks } from '../../features/tasks/useTasks'
import { useAuth } from '../../features/auth/useAuth'
import { useHousehold } from '../../features/household/useHousehold'
import { useAppMock, type MockTask } from '../mockState'

export function TodayPage() {
  const { avatarConfig, householdName, tasks: mockTasks, toggleTask, addTask, members } = useAppMock()
  const { user } = useAuth()
  const { activeHousehold, currentMember, isLoading: householdLoading } = useHousehold()
  const householdId = user ? activeHousehold?.id ?? null : null
  // While a signed-in user's household is still loading, don't fall back to mock tasks.
  const waitingForHousehold = Boolean(user) && householdLoading && !householdId

  const tasksApi = useTasks(householdId)
  const completionsApi = useTaskCompletions(householdId)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const allTasks = householdId ? tasksApi.tasks : waitingForHousehold ? [] : mockTasks

  function countFor(task: MockTask): number {
    if (householdId) return completionsApi.completionCountForPeriod(task.id, task.recurrence)
    if (task.repeatable) return task.completionCount ?? 0
    return task.completed ? 1 : 0
  }

  const tasks: MockTask[] = useMemo(
    () =>
      householdId
        ? allTasks.map((task) => {
            const count = completionsApi.completionCountForPeriod(task.id, task.recurrence)
            return {
              ...task,
              completed: count > 0,
              completedBy: count > 0 ? user?.displayName : undefined,
            }
          })
        : allTasks,
    [allTasks, householdId, completionsApi, user],
  )

  const completionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const task of tasks) counts[task.id] = countFor(task)
    return counts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, householdId, completionsApi])

  const completed = tasks.filter((task) => completionCounts[task.id] > 0).length
  const total = tasks.length
  const percent = total ? Math.round((completed / total) * 100) : 0
  const earnedXp = tasks.reduce((sum, task) => sum + task.points * completionCounts[task.id], 0)
  const todaysTasks = useMemo(
    () => tasks.filter((task) => task.recurrence !== 'once' || completionCounts[task.id] === 0),
    [tasks, completionCounts],
  )
  const level = currentMember?.level?.level ?? 1
  const streakCurrent = currentMember?.streak?.current ?? 0

  function handleToggle(taskId: string) {
    const activeTask = tasks.find((item) => item.id === taskId)
    if (!activeTask) return
    if (householdId) {
      if (activeTask.repeatable) {
        void completionsApi.completeTask(activeTask.id, activeTask.points, activeTask.recurrence, true)
      } else if (completionsApi.completionCountForPeriod(activeTask.id, activeTask.recurrence) > 0) {
        void completionsApi.undoLastCompletion(activeTask.id, activeTask.recurrence)
      } else {
        void completionsApi.completeTask(activeTask.id, activeTask.points, activeTask.recurrence, false)
      }
    } else {
      toggleTask(taskId)
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-mint-200 p-1 shadow-card">
            <AvatarPreview config={avatarConfig} size={48} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-extrabold text-ink">{user?.displayName ?? 'Maya'}</h1>
              <span className="rounded-full bg-mint-200/70 px-2 py-0.5 font-display text-[10px] font-extrabold text-mint-700">Lvl {level}</span>
            </div>
            <Link to="/household" className="text-xs font-bold text-pebble">
              {householdName}
            </Link>
          </div>
        </div>
        <span className="rounded-full bg-coral-100 px-3 py-1.5 font-display text-xs font-extrabold text-coral-700 shadow-[0_3px_0_rgba(132,36,21,0.15)]">
          🔥 {streakCurrent} Days
        </span>
      </section>

      <section className="rounded-4xl bg-white p-4 shadow-card">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">Today's Chore Quest</h2>
            <p className="mt-0.5 text-xs font-bold text-pebble">
              {completed} of {total} done · Keep blooming
            </p>
          </div>
          <span className="rounded-full bg-honey-100 px-3 py-1 font-display text-xs font-extrabold text-honey-700">
            +{earnedXp} XP
          </span>
        </div>
        <div className="mb-1 flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-pebble">
          <span>Daily Goal</span>
          <span className="text-mint-600">{percent}% Complete</span>
        </div>
        <div className="h-3.5 rounded-full bg-lavender-100 p-0.5 shadow-inner">
          <div className="h-full rounded-full bg-mint-300 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </section>

      <section className="flex items-center justify-between px-1">
        <h2 className="font-display text-lg font-extrabold text-ink">Quest Log ({todaysTasks.length})</h2>
        <Link to="/tasks" className="font-display text-xs font-extrabold text-coral-400">
          Manage Tasks
        </Link>
      </section>

      <TaskList tasks={waitingForHousehold ? [] : todaysTasks} onToggle={handleToggle} completionCounts={completionCounts} />
      {waitingForHousehold && (
        <p className="text-center text-sm font-bold text-pebble">Loading your household's chores...</p>
      )}

      <button
        type="button"
        aria-label="Add task"
        onClick={() => setQuickAddOpen(true)}
        className="fixed bottom-24 right-[max(1.25rem,calc((100vw-28rem)/2+1.25rem))] z-30 grid h-14 w-14 place-items-center rounded-full bg-coral-400 text-3xl text-white shadow-button transition-all active:translate-y-1"
      >
        +
      </button>

      <Modal open={quickAddOpen} title="Quick Chore" subtitle="Post a chore quest" onClose={() => setQuickAddOpen(false)}>
        <CreateTaskForm
          members={members}
          onCancel={() => setQuickAddOpen(false)}
          onSave={(draft) => {
            if (householdId) void tasksApi.createTask(draft)
            else addTask(draft)
            setQuickAddOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
