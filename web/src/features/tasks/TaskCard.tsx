import type { HouseholdTask } from '../../types/models'

interface TaskCardProps {
  task: HouseholdTask
  completed?: boolean
  onComplete: () => void
}

export function TaskCard({ task, completed = false, onComplete }: TaskCardProps) {
  return (
    <button
      type="button"
      onClick={onComplete}
      className="border-brand-100 shadow-card hover:bg-brand-50 flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left transition-colors"
    >
      <span className="text-sm font-bold text-slate-700">{task.title}</span>
      <span className="bg-brand-50 text-brand-700 rounded-full px-3 py-1 text-xs font-bold">
        {task.points} pts
      </span>
      {completed && <span className="text-brand-600 text-xs font-bold">Done</span>}
    </button>
  )
}
