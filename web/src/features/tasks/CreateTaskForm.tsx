import { useState, type FormEvent } from 'react'
import type { MockTask, TaskDraft } from '../../app/mockState'
import { Button } from '../../components/Button'
import type { TaskRecurrence } from '../../types/models'

interface CreateTaskFormProps {
  initialTask?: MockTask
  onSave: (draft: TaskDraft) => void
  onCancel: () => void
}

const recurrences: TaskRecurrence[] = ['daily', 'weekly', 'once']
const emojis = ['🍽️', '🪴', '🗑️', '☕', '🧹', '🧺', '🐾', '🛒']
const assignees = ['Anyone', 'Maya', 'Leo', 'Sam', 'Chloe']

export function CreateTaskForm({ initialTask, onSave, onCancel }: CreateTaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? 'Wash dinner dishes & wipe counter')
  const [points, setPoints] = useState(initialTask?.points ?? 50)
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(initialTask?.recurrence ?? 'daily')
  const [assignedTo, setAssignedTo] = useState(initialTask?.assignee ?? 'Maya')
  const [icon, setIcon] = useState(initialTask?.icon ?? '🍽️')
  const [room, setRoom] = useState(initialTask?.room ?? 'Kitchen')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      title: title.trim() || 'Untitled cozy chore',
      points,
      recurrence,
      assignedTo: assignedTo === 'Anyone' ? undefined : assignedTo,
      icon,
      room: room.trim() || 'Household',
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="mb-2 block font-display text-sm font-extrabold text-ink">Task Name</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-13 w-full rounded-2xl border border-outline bg-cream px-4 text-sm font-bold text-ink outline-none transition focus:border-coral-400 focus:ring-4 focus:ring-coral-100"
          placeholder="What needs to be done?"
        />
      </label>

      <section className="flex items-center justify-between rounded-2xl bg-lavender-100 p-3">
        <div>
          <span className="font-display text-sm font-extrabold text-ink">Chore Reward</span>
          <p className="text-xs font-semibold text-pebble">Default household chore value</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white p-1.5 shadow-card">
          <button type="button" onClick={() => setPoints((value) => Math.max(5, value - 5))} className="grid h-8 w-8 place-items-center rounded-full bg-lavender-100 font-bold text-ink">
            -
          </button>
          <span className="min-w-16 text-center font-display text-sm font-extrabold text-ink">{points} XP</span>
          <button type="button" onClick={() => setPoints((value) => value + 5)} className="grid h-8 w-8 place-items-center rounded-full bg-honey-100 font-bold text-honey-700">
            +
          </button>
        </div>
      </section>

      <section>
        <span className="mb-2 block font-display text-sm font-extrabold text-ink">Repeat Frequency</span>
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-lavender-100 p-1.5">
          {recurrences.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRecurrence(value)}
              className={`rounded-xl py-2.5 font-display text-xs font-extrabold capitalize transition-all active:scale-95 ${
                recurrence === value ? 'bg-coral-400 text-white shadow-[0_3px_0_#e2634d]' : 'text-pebble'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <section>
        <span className="mb-2 block font-display text-sm font-extrabold text-ink">Assigned Homie</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {assignees.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setAssignedTo(name)}
              className={`min-w-20 rounded-2xl px-3 py-2 font-display text-xs font-extrabold shadow-card active:scale-95 ${
                assignedTo === name ? 'bg-coral-100 text-coral-700 ring-2 ring-coral-300' : 'bg-white text-pebble'
              }`}
            >
              <span className="mx-auto mb-1 grid h-9 w-9 place-items-center rounded-full bg-lavender-100">{name[0]}</span>
              {name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <span className="mb-2 block font-display text-sm font-extrabold text-ink">Chore Category Icon</span>
        <div className="grid grid-cols-4 gap-2">
          {emojis.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setIcon(value)}
              className={`rounded-2xl p-3 text-2xl shadow-card transition-all active:scale-95 ${
                icon === value ? 'bg-mint-200 ring-2 ring-mint-300' : 'bg-lavender-100'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <label className="block">
        <span className="mb-2 block font-display text-sm font-extrabold text-ink">Room / Place</span>
        <input
          value={room}
          onChange={(event) => setRoom(event.target.value)}
          className="h-13 w-full rounded-2xl border border-outline bg-cream px-4 text-sm font-bold text-ink outline-none transition focus:border-coral-400 focus:ring-4 focus:ring-coral-100"
          placeholder="Kitchen, Pantry, Bathroom..."
        />
      </label>

      <div className="flex flex-col gap-3 pt-1">
        <Button type="submit" className="w-full">
          Save Task
        </Button>
        <Button variant="ghost" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    </form>
  )
}
