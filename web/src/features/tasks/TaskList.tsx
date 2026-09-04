import type { MockTask } from '../../app/mockState'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: MockTask[]
  onToggle: (id: string) => void
  completionCounts?: Record<string, number>
}

export function TaskList({ tasks, onToggle, completionCounts }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className="rounded-4xl bg-white p-6 text-center shadow-card">
        <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-lavender-100 text-3xl">✨</div>
        <h2 className="font-display text-xl font-extrabold text-ink">No chores yet</h2>
        <p className="mt-1 text-sm font-semibold text-pebble">Add a cozy quest to get the household moving.</p>
      </section>
    )
  }

  return (
    <section className="space-y-2.5">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          completionCount={completionCounts?.[task.id] ?? task.completionCount ?? 0}
          onComplete={() => onToggle(task.id)}
        />
      ))}
    </section>
  )
}
