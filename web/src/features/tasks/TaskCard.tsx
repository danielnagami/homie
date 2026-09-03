import type { ReactNode } from 'react'
import type { MockTask } from '../../app/mockState'

interface TaskCardProps {
  task: MockTask
  onComplete: () => void
  actions?: ReactNode
}

const stripeClass: Record<MockTask['category'], string> = {
  cleaning: 'bg-mint-300',
  plants: 'bg-mint-600',
  supplies: 'bg-coral-400',
  pets: 'bg-honey-300',
  laundry: 'bg-sky-300',
}

export function TaskCard({ task, onComplete, actions }: TaskCardProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl p-3.5 shadow-card transition-all ${task.completed ? 'bg-mint-100/70' : 'bg-white'}`}
    >
      <span className={`absolute bottom-3 left-0 top-3 w-1.5 rounded-r-full ${stripeClass[task.category]}`} />
      <div className="flex items-center justify-between gap-3 pl-2">
        <button type="button" onClick={onComplete} className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99]">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-lavender-100 text-xl shadow-sm">
            {task.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-honey-100 px-2 py-0.5 font-display text-[10px] font-extrabold text-honey-700">
                +{task.points} XP
              </span>
              <span className="rounded-full bg-lavender-100 px-2 py-0.5 font-display text-[10px] font-extrabold text-pebble">
                {task.assignee === 'Maya' ? 'Assigned to You' : task.assignee}
              </span>
            </span>
            <span className={`block truncate font-display text-[15px] font-extrabold ${task.completed ? 'text-pebble line-through' : 'text-ink'}`}>
              {task.title}
            </span>
            <span className={`block text-xs font-bold ${task.completed ? 'text-mint-600' : 'text-pebble'}`}>
              {task.completed ? `Done by ${task.completedBy}` : `${task.room} · ${task.due}`}
            </span>
          </span>
        </button>
        <div className="flex flex-shrink-0 items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={onComplete}
            aria-label={task.completed ? 'Mark incomplete' : 'Complete task'}
            className={`grid h-8 w-8 place-items-center rounded-full font-display font-extrabold transition-all active:translate-y-0.5 ${
              task.completed
                ? 'bg-mint-600 text-white shadow-[0_2px_0_#005230]'
                : 'bg-lavender-100 text-transparent shadow-[0_3px_0_#dec0ba]'
            }`}
          >
            ✓
          </button>
        </div>
      </div>
    </article>
  )
}
