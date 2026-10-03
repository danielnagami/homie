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
  const {
    avatarConfig,
    householdName,
    tasks: mockTasks,
    toggleTask,
    undoTaskCompletion,
    addTask,
    members,
  } = useAppMock()
  const { user } = useAuth()
  const { activeHousehold, currentMember, isLoading: householdLoading } = useHousehold()
  const householdId = user ? (activeHousehold?.id ?? null) : null
  // While a signed-in user's household is still loading, don't fall back to mock tasks.
  const waitingForHousehold = Boolean(user) && householdLoading && !householdId

  const tasksApi = useTasks(householdId)
  const completionsApi = useTaskCompletions(householdId, activeHousehold?.timeZone)
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
        void completionsApi.completeTask(
          activeTask.id,
          activeTask.points,
          activeTask.recurrence,
          true,
        )
      } else if (
        completionsApi.completionCountForPeriod(activeTask.id, activeTask.recurrence) > 0
      ) {
        void completionsApi.undoLastCompletion(activeTask.id, activeTask.recurrence)
      } else {
        void completionsApi.completeTask(
          activeTask.id,
          activeTask.points,
          activeTask.recurrence,
          false,
        )
      }
    } else {
      toggleTask(taskId)
    }
  }

  function handleUndoCompletion(taskId: string) {
    const activeTask = tasks.find((item) => item.id === taskId)
    if (!activeTask?.repeatable) return
    if (householdId) {
      void completionsApi.undoLastCompletion(activeTask.id, activeTask.recurrence)
    } else {
      undoTaskCompletion(taskId)
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="bg-mint-200 shadow-card rounded-full p-1">
            <AvatarPreview config={avatarConfig} size={48} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-ink text-xl font-extrabold">
                {user?.displayName ?? 'Maya'}
              </h1>
              <span className="bg-mint-200/70 font-display text-mint-700 rounded-full px-2 py-0.5 text-[10px] font-extrabold">
                Lvl {level}
              </span>
            </div>
            <Link to="/household" className="text-pebble text-xs font-bold">
              {householdName}
            </Link>
          </div>
        </div>
        <span className="bg-coral-100 font-display text-coral-700 rounded-full px-3 py-1.5 text-xs font-extrabold shadow-[0_3px_0_rgba(132,36,21,0.15)]">
          🔥 {streakCurrent} Days
        </span>
      </section>

      <section className="shadow-card rounded-4xl bg-white p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-ink text-xl font-extrabold">Today's Chore Quest</h2>
            <p className="text-pebble mt-0.5 text-xs font-bold">
              {completed} of {total} done · Keep blooming
            </p>
          </div>
          <span className="bg-honey-100 font-display text-honey-700 rounded-full px-3 py-1 text-xs font-extrabold">
            +{earnedXp} XP
          </span>
        </div>
        <div className="text-pebble mb-1 flex justify-between text-[10px] font-extrabold tracking-wider uppercase">
          <span>Daily Goal</span>
          <span className="text-mint-600">{percent}% Complete</span>
        </div>
        <div className="bg-lavender-100 h-3.5 rounded-full p-0.5 shadow-inner">
          <div
            className="bg-mint-300 h-full rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      <section className="flex items-center justify-between px-1">
        <h2 className="font-display text-ink text-lg font-extrabold">
          Quest Log ({todaysTasks.length})
        </h2>
        <Link to="/tasks" className="font-display text-coral-400 text-xs font-extrabold">
          Manage Tasks
        </Link>
      </section>

      <TaskList
        tasks={waitingForHousehold ? [] : todaysTasks}
        onToggle={handleToggle}
        onUndoCompletion={handleUndoCompletion}
        completionCounts={completionCounts}
      />
      {waitingForHousehold && (
        <p className="text-pebble text-center text-sm font-bold">
          Loading your household's chores...
        </p>
      )}

      <button
        type="button"
        aria-label="Add task"
        onClick={() => setQuickAddOpen(true)}
        className="bg-coral-400 shadow-button fixed right-[max(1.25rem,calc((100vw-28rem)/2+1.25rem))] bottom-24 z-30 grid h-14 w-14 place-items-center rounded-full text-3xl text-white transition-all active:translate-y-1"
      >
        +
      </button>

      <Modal
        open={quickAddOpen}
        title="Quick Chore"
        subtitle="Post a chore quest"
        onClose={() => setQuickAddOpen(false)}
      >
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
