import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore'
import { auth, db as firestore } from '../../firebase/firebaseClient'
import { initialTasks, type MockTask, type TaskDraft } from '../../app/mockState'
import type { TaskRecurrence } from '../../types/models'

export interface TaskRecord {
  id: string
  title: string
  points: number
  recurrence: TaskRecurrence
  assignedTo?: string
  icon?: string
  room?: string
  active: boolean
  createdBy: string
}

export interface TasksState {
  tasks: MockTask[]
  isLoading: boolean
  error: string | null
  createTask: (draft: TaskDraft) => Promise<void>
  updateTask: (id: string, draft: TaskDraft) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

function toMockTask(record: TaskRecord): MockTask {
  return {
    id: record.id,
    title: record.title,
    points: record.points,
    recurrence: record.recurrence,
    assignedTo: record.assignedTo,
    assignee: record.assignedTo || 'Anyone',
    active: record.active,
    createdBy: record.createdBy,
    icon: record.icon || '🧹',
    room: record.room || 'Household',
    due: 'Freshly posted',
    category: 'cleaning',
    completed: false,
  }
}

export function useTasks(householdId?: string | null): TasksState {
  const [firestoreTasks, setFirestoreTasks] = useState<MockTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeHouseholdId = householdId ?? undefined

  useEffect(() => {
    if (!firestore || !activeHouseholdId) return

    const unsubscribe = onSnapshot(
      collection(firestore, 'households', activeHouseholdId, 'tasks'),
      (snapshot) => {
        setFirestoreTasks(
          snapshot.docs
            .map((taskDoc) => toMockTask({ id: taskDoc.id, ...taskDoc.data() } as TaskRecord))
            .filter((task) => task.active),
        )
        setIsLoading(false)
      },
      (cause) => setError(cause instanceof Error ? cause.message : 'Failed to load tasks.'),
    )

    return unsubscribe
  }, [activeHouseholdId])

  const tasks = activeHouseholdId ? firestoreTasks : initialTasks

  const createTask = async (draft: TaskDraft): Promise<void> => {
    if (!firestore || !activeHouseholdId || !auth?.currentUser) {
      setError('You must sign in and join a household to add tasks.')
      return
    }
    setError(null)
    try {
      await addDoc(collection(firestore, 'households', activeHouseholdId, 'tasks'), {
        title: draft.title,
        points: draft.points,
        recurrence: draft.recurrence,
        assignedTo: draft.assignedTo ?? null,
        icon: draft.icon,
        room: draft.room,
        active: true,
        createdBy: auth.currentUser.uid,
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to add task.')
    }
  }

  const updateTask = async (id: string, draft: TaskDraft): Promise<void> => {
    if (!firestore || !activeHouseholdId) return
    setError(null)
    try {
      await setDoc(doc(firestore, 'households', activeHouseholdId, 'tasks', id), {
        title: draft.title,
        points: draft.points,
        recurrence: draft.recurrence,
        assignedTo: draft.assignedTo ?? null,
        icon: draft.icon,
        room: draft.room,
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to update task.')
    }
  }

  const deleteTask = async (id: string): Promise<void> => {
    if (!firestore || !activeHouseholdId) return
    setError(null)
    try {
      await deleteDoc(doc(firestore, 'households', activeHouseholdId, 'tasks', id))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to delete task.')
    }
  }

  return { tasks, isLoading, error, createTask, updateTask, deleteTask }
}