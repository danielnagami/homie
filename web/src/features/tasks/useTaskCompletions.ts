import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, runTransaction } from 'firebase/firestore'
import { auth, db as firestore } from '../../firebase/firebaseClient'
import type { TaskCompletion, TaskRecurrence } from '../../types/models'

function toDateKey(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toWeekKey(date: Date): string {
  const start = new Date(date)
  const day = start.getUTCDay()
  start.setUTCDate(start.getUTCDate() - day)
  return toDateKey(start)
}

function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function completionId(taskId: string, userId: string, recurrence: TaskRecurrence, now: Date): string {
  const periodKey = recurrence === 'weekly' ? toWeekKey(now) : recurrence === 'once' ? 'once' : toDateKey(now)
  return `${encodeURIComponent(taskId).replaceAll('/', '%2F')}_${userId}_${periodKey}`
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
  completionCountForPeriod: (taskId: string, recurrence: TaskRecurrence) => number
  completeTask: (taskId: string, points: number, recurrence: TaskRecurrence, repeatable: boolean) => Promise<void>
  unCompleteTask: (taskId: string) => Promise<void>
  undoLastCompletion: (taskId: string, recurrence: TaskRecurrence) => Promise<void>
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

  function myCompletionsInPeriod(taskId: string, recurrence: TaskRecurrence): TaskCompletion[] {
    const now = new Date()
    return completions.filter((completion) => {
      if (completion.taskId !== taskId || completion.userId !== myUid) return false
      if (recurrence === 'weekly') return completion.weekKey === toWeekKey(now)
      if (recurrence === 'once') return true
      return completion.dateKey === toDateKey(now)
    })
  }

  function completionCountForPeriod(taskId: string, recurrence: TaskRecurrence): number {
    return myCompletionsInPeriod(taskId, recurrence).length
  }

  async function completeTask(taskId: string, points: number, recurrence: TaskRecurrence, repeatable: boolean): Promise<void> {
    if (!firestore || !activeHouseholdId || !auth?.currentUser) {
      setError('You must sign in and join a household.')
      return
    }

    const user = auth.currentUser
    const now = new Date()
    setError(null)
    try {
      const completion = {
        taskId,
        userId: user.uid,
        completedAt: now.toISOString(),
        dateKey: toDateKey(now),
        pointsAwarded: points,
        weekKey: toWeekKey(now),
        monthKey: toMonthKey(now),
      }

      if (repeatable) {
        await addDoc(collection(firestore, 'households', activeHouseholdId, 'taskCompletions'), completion)
        return
      }

      // A normal task can only be completed once in its recurrence period. A stable
      // id and transaction make a second tap a no-op instead of a second XP award.
      const completionRef = doc(
        firestore,
        'households',
        activeHouseholdId,
        'taskCompletions',
        completionId(taskId, user.uid, recurrence, now),
      )
      await runTransaction(firestore, async (transaction) => {
        if ((await transaction.get(completionRef)).exists()) return
        transaction.set(completionRef, completion)
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

  async function undoLastCompletion(taskId: string, recurrence: TaskRecurrence): Promise<void> {
    if (!firestore || !activeHouseholdId || !myUid) return
    const mine = myCompletionsInPeriod(taskId, recurrence).sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0]
    if (!mine) return
    setError(null)
    try {
      await deleteDoc(doc(firestore, 'households', activeHouseholdId, 'taskCompletions', mine.id))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to undo completion.')
    }
  }

  return {
    completions,
    isLoading,
    error,
    isCompletedByMe,
    completionCountForPeriod,
    completeTask,
    unCompleteTask,
    undoLastCompletion,
  }
}
