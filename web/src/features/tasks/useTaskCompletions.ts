import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { auth, db as firestore } from '../../firebase/firebaseClient'
import type { TaskCompletion } from '../../types/models'

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toWeekKey(date: Date): string {
  const start = new Date(date)
  const day = start.getDay()
  start.setDate(start.getDate() - day)
  return toDateKey(start)
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function toCompletion(id: string, data: Record<string, unknown>): TaskCompletion {
  return {
    id,
    taskId: String(data.taskId ?? ''),
    userId: String(data.userId ?? ''),
    completedAt: String(data.completedAt ?? ''),
    dateKey: String(data.dateKey ?? ''),
    pointsAwarded: Number(data.pointsAwarded ?? 0),
    weekKey: String(data.weekKey ?? ''),
    monthKey: String(data.monthKey ?? ''),
  }
}

export interface TaskCompletionsState {
  completions: TaskCompletion[]
  isLoading: boolean
  error: string | null
  isCompletedByMe: (taskId: string, dateKey?: string) => boolean
  completeTask: (taskId: string, points: number) => Promise<void>
  unCompleteTask: (taskId: string) => Promise<void>
}

export function useTaskCompletions(householdId?: string | null): TaskCompletionsState {
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeHouseholdId = householdId ?? undefined

  useEffect(() => {
    if (!firestore || !activeHouseholdId) return

    const unsubscribe = onSnapshot(
      collection(firestore, 'households', activeHouseholdId, 'taskCompletions'),
      (snapshot) => {
        setCompletions(snapshot.docs.map((completionDoc) => toCompletion(completionDoc.id, completionDoc.data())))
        setIsLoading(false)
      },
      (cause) => setError(cause instanceof Error ? cause.message : 'Failed to load completions.'),
    )

    return unsubscribe
  }, [activeHouseholdId])

  const myUid = auth?.currentUser?.uid

  function isCompletedByMe(taskId: string, dateKey?: string): boolean {
    const key = dateKey ?? toDateKey(new Date())
    return completions.some(
      (completion) => completion.taskId === taskId && completion.userId === myUid && completion.dateKey === key,
    )
  }

  async function completeTask(taskId: string, points: number): Promise<void> {
    if (!firestore || !activeHouseholdId || !auth?.currentUser) {
      setError('You must sign in and join a household.')
      return
    }

    const user = auth.currentUser
    const now = new Date()
    setError(null)
    try {
      await addDoc(collection(firestore, 'households', activeHouseholdId, 'taskCompletions'), {
        taskId,
        userId: user.uid,
        completedAt: now.toISOString(),
        dateKey: toDateKey(now),
        pointsAwarded: points,
        weekKey: toWeekKey(now),
        monthKey: toMonthKey(now),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to complete task.')
    }
  }

  async function unCompleteTask(taskId: string): Promise<void> {
    if (!firestore || !activeHouseholdId || !myUid) return
    const key = toDateKey(new Date())
    const mine = completions.find(
      (completion) => completion.taskId === taskId && completion.userId === myUid && completion.dateKey === key,
    )
    if (!mine) return
    setError(null)
    try {
      await deleteDoc(doc(firestore, 'households', activeHouseholdId, 'taskCompletions', mine.id))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to un-complete task.')
    }
  }

  return {
    completions,
    isLoading,
    error,
    isCompletedByMe,
    completeTask,
    unCompleteTask,
  }
}