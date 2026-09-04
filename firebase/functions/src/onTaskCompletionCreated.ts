import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import type { DocumentData, DocumentReference, Timestamp } from 'firebase-admin/firestore'
import { levelForXp } from './leveling.js'
import { unlockableAchievements } from './achievements.js'

interface CompletionData {
  taskId: string
  userId: string
  completedAt?: string | Timestamp
  dateKey?: string
  pointsAwarded?: number
  weekKey?: string
  monthKey?: string
  processed?: boolean
}

interface TaskData {
  title?: string
  points?: number
  recurrence?: 'daily' | 'weekly' | 'once'
  assignedTo?: string | null
  active?: boolean
  createdBy?: string
}

function previousDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  if (![year, month, day].every((part) => Number.isInteger(part))) return ''
  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime())) return ''
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export const onTaskCompletionCreated = onDocumentCreated(
  'households/{householdId}/taskCompletions/{completionId}',
  async (event) => {
    const householdId = event.params.householdId
    const completionId = event.params.completionId
    const completion = event.data
    if (!completion) return

    const data = completion.data() as CompletionData
    const taskId = data.taskId
    const userId = data.userId
    const points = Number(data.pointsAwarded ?? 0)
    const dateKey = data.dateKey ?? new Date().toISOString().slice(0, 10)
    const processedKey = 'processed'

    const db = getFirestore()
    const completionRef = db.doc(`households/${householdId}/taskCompletions/${completionId}`)
    const taskRef = db.doc(`households/${householdId}/tasks/${taskId}`)
    const memberRef = db.doc(`households/${householdId}/members/${userId}`)

    if (!userId || !taskId) return

    await db.runTransaction(async (transaction) => {
      const processedDoc = await transaction.get(completionRef)
      if (processedDoc.exists && processedDoc.data()?.processed === true) return

      const taskSnapshot = await transaction.get(taskRef)
      if (!taskSnapshot.exists) {
        await transaction.update(completionRef, { [processedKey]: true, processedReason: 'task-missing' })
        return
      }

      const task = taskSnapshot.data() as TaskData
      if (task.active === false) {
        await transaction.update(completionRef, { [processedKey]: true, processedReason: 'task-inactive' })
        return
      }

      if (task.recurrence === 'once') {
        const duplicates = await db
          .collection(`households/${householdId}/taskCompletions`)
          .where('taskId', '==', taskId)
          .limit(2)
          .get()
        if (duplicates.size > 1) {
          await transaction.update(completionRef, { [processedKey]: true, processedReason: 'once-duplicate' })
          return
        }
      }

      const memberSnapshot = await transaction.get(memberRef)
      const memberNow = memberSnapshot.exists ? memberSnapshot.data() : null
      const streak = (memberNow?.streak ?? {}) as Record<string, number | string>
      // households/join create the member doc up front (displayName/avatarConfig/joinedAt only),
      // so `memberSnapshot.exists` is true well before gamification fields are ever set.
      const hasGamificationFields = Boolean(memberNow?.totals)

      const increment = FieldValue.increment(points)

      const newTotals = {
        lifetimePoints: increment,
        dailyPoints: increment,
        weeklyPoints: increment,
        monthlyPoints: increment,
      }

      if (!hasGamificationFields) {
        const initialLevel = levelForXp(points)
        transaction.set(
          memberRef,
          {
            totals: {
              lifetimePoints: points,
              dailyPoints: points,
              weeklyPoints: points,
              monthlyPoints: points,
            },
            streak: { current: 1, longest: 1, lastCompletedDate: dateKey },
            level: { level: initialLevel.level, xp: points, xpToNextLevel: initialLevel.xpToNextLevel },
          },
          { merge: true },
        )
      } else {
        const lastCompletedDate = String(streak.lastCompletedDate ?? '')
        let currentStreak = Number(streak.current ?? 0)
        let longestStreak = Number(streak.longest ?? 0)

        if (lastCompletedDate === dateKey) {
          // Same day, keep current streak.
        } else if (lastCompletedDate && previousDateKey(lastCompletedDate) === dateKey) {
          currentStreak += 1
        } else {
          currentStreak = 1
        }
        longestStreak = Math.max(longestStreak, currentStreak)

        const memberTotals = (memberNow?.totals ?? {}) as Record<string, number>
        const lifetimeBefore = Number(memberTotals.lifetimePoints ?? 0)
        const lifetimeAfter = lifetimeBefore + points
        const levelState = levelForXp(lifetimeAfter)

        transaction.update(memberRef, {
          totals: newTotals,
          streak: { current: currentStreak, longest: longestStreak, lastCompletedDate: dateKey },
          level: { level: levelState.level, xp: lifetimeAfter, xpToNextLevel: levelState.xpToNextLevel },
        })
      }

      await transaction.update(completionRef, { [processedKey]: true })
    })

    void checkAchievements(db, householdId, userId, memberRef)
  },
)

async function checkAchievements(
  db: ReturnType<typeof getFirestore>,
  householdId: string,
  userId: string,
  memberRef: DocumentReference<DocumentData>,
): Promise<void> {
  if (!userId) return

  const [memberSnapshot, completionsSnapshot, unlockedSnapshot] = await Promise.all([
    memberRef.get(),
    db.collection(`households/${householdId}/taskCompletions`).where('userId', '==', userId).get(),
    db.collection(`households/${householdId}/members/${userId}/unlockedAchievements`).get(),
  ])

  const memberData = memberSnapshot.exists ? memberSnapshot.data() : null
  const levelState = (memberData?.level ?? {}) as Record<string, number>
  const totals = (memberData?.totals ?? {}) as Record<string, number>
  const unlockable = unlockableAchievements(
    new Set(unlockedSnapshot.docs.map((doc) => doc.id)),
    {
      taskCount: completionsSnapshot.size,
      streak: Number((memberData?.streak as Record<string, number> | undefined)?.current ?? 0),
      level: levelState.level ?? 1,
      lifetimePoints: totals.lifetimePoints ?? 0,
    },
  )

  await Promise.all(
    unlockable.map((achievement) =>
      db.doc(`households/${householdId}/members/${userId}/unlockedAchievements/${achievement.id}`).set({
        unlockedAt: new Date().toISOString(),
      }),
    ),
  )
}

// Un-completing a task deletes its completion doc; reverse the points/level that
// onTaskCompletionCreated awarded so totals stay accurate. Streak is left as-is since
// recomputing it from history would require re-scanning all completions.
export const onTaskCompletionDeleted = onDocumentDeleted(
  'households/{householdId}/taskCompletions/{completionId}',
  async (event) => {
    const householdId = event.params.householdId
    const completion = event.data
    if (!completion) return

    const data = completion.data() as CompletionData
    if (data.processed !== true) return

    const userId = data.userId
    const points = Number(data.pointsAwarded ?? 0)
    if (!userId || !points) return

    const db = getFirestore()
    const memberRef = db.doc(`households/${householdId}/members/${userId}`)

    await db.runTransaction(async (transaction) => {
      const memberSnapshot = await transaction.get(memberRef)
      if (!memberSnapshot.exists) return

      const memberNow = memberSnapshot.data()
      const totals = (memberNow?.totals ?? {}) as Record<string, number>
      const lifetimeAfter = Math.max(0, Number(totals.lifetimePoints ?? 0) - points)
      const levelState = levelForXp(lifetimeAfter)

      transaction.update(memberRef, {
        totals: {
          lifetimePoints: FieldValue.increment(-points),
          dailyPoints: FieldValue.increment(-points),
          weeklyPoints: FieldValue.increment(-points),
          monthlyPoints: FieldValue.increment(-points),
        },
        level: { level: levelState.level, xp: lifetimeAfter, xpToNextLevel: levelState.xpToNextLevel },
      })
    })
  },
)