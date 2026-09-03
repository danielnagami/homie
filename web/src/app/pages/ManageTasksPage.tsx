import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { CreateTaskForm } from '../../features/tasks/CreateTaskForm'
import { TaskCard } from '../../features/tasks/TaskCard'
import type { MockTask } from '../mockState'
import { useAppMock } from '../mockState'

type Filter = 'all' | 'daily' | 'weekly' | 'once'

export function ManageTasksPage() {
  const { householdName, tasks, toggleTask, addTask, updateTask, deleteTask } = useAppMock()
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<MockTask | null>(null)
  const [creating, setCreating] = useState(false)
  const visible = useMemo(
    () => tasks.filter((task) => (filter === 'all' ? true : task.recurrence === filter)),
    [filter, tasks],
  )

  const filters: Filter[] = ['all', 'daily', 'weekly', 'once']

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink">Manage Tasks</h1>
            <p className="mt-1 text-sm font-bold text-pebble">{householdName} · changes update local mock state</p>
          </div>
          <Button onClick={() => setCreating(true)} className="min-h-11 px-4">Add</Button>
        </div>
      </header>

      <section className="rounded-3xl bg-lavender-100 p-3 shadow-card">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-mint-600" />
          <p className="text-sm font-bold text-pebble">Changes update instantly for all roommates once Firestore wiring lands.</p>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-2 font-display text-xs font-extrabold capitalize shadow-card transition-all active:scale-95 ${
              filter === value ? 'bg-coral-400 text-white' : 'bg-white text-pebble'
            }`}
          >
            {value} <span className="opacity-75">{value === 'all' ? tasks.length : tasks.filter((task) => task.recurrence === value).length}</span>
          </button>
        ))}
      </section>

      <section className="space-y-4">
        {(['daily', 'weekly', 'once'] as const).map((recurrence) => {
          const group = visible.filter((task) => task.recurrence === recurrence)
          if (group.length === 0) return null
          return (
            <div key={recurrence} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-display text-lg font-extrabold capitalize text-ink">
                  {recurrence === 'daily' ? '☀️ Daily Chores' : recurrence === 'weekly' ? '📅 Weekly Chores' : '✨ One-Off Quests'}
                </h2>
                <span className="rounded-full bg-honey-100 px-3 py-1 font-display text-[10px] font-extrabold text-honey-700">
                  {group.length} active
                </span>
              </div>
              {group.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => toggleTask(task.id)}
                  actions={
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(task)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-lavender-100 text-sm text-pebble shadow-sm transition-transform active:scale-90"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-red-100 text-sm text-red-700 shadow-sm transition-transform active:scale-90"
                      >
                        ×
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          )
        })}
      </section>

      <Modal open={creating} title="Create Task" subtitle="Local prototype dialog" onClose={() => setCreating(false)}>
        <CreateTaskForm
          onCancel={() => setCreating(false)}
          onSave={(draft) => {
            addTask(draft)
            setCreating(false)
          }}
        />
      </Modal>

      <Modal open={Boolean(editing)} title="Edit Task" subtitle={editing ? `Editing: ${editing.title}` : undefined} onClose={() => setEditing(null)}>
        {editing && (
          <CreateTaskForm
            initialTask={editing}
            onCancel={() => setEditing(null)}
            onSave={(draft) => {
              updateTask(editing.id, draft)
              setEditing(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
