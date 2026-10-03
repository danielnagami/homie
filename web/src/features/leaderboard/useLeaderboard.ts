import { useEffect, useState } from 'react'
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore'
import { db as firestore } from '../../firebase/firebaseClient'
import { toDateKey, toMonthKey, toWeekKey } from '../../lib/householdTime'
import type { HouseholdMember } from '../../types/models'

export type LeaderboardPeriod = 'day' | 'week' | 'month'

export interface LeaderboardEntry {
  uid: string
  name: string
  streak: number
  displayName: string
  avatarConfig: HouseholdMember['avatarConfig'] | null
  points: number
}

export interface LeaderboardState {
  entries: LeaderboardEntry[]
  isLoading: boolean
  error: string | null
  period: LeaderboardPeriod
  setPeriod: (period: LeaderboardPeriod) => void
  selectedDateKey: string
  setSelectedDateKey: (dateKey: string) => void
  todayDateKey: string
  hasActivity: boolean
}

function isInSelectedPeriod(
  completion: DocumentData,
  period: LeaderboardPeriod,
  now: Date,
  selectedDateKey: string,
  timeZone: string,
): boolean {
  if (period === 'day') return completion.dateKey === selectedDateKey
  if (period === 'week') return completion.weekKey === toWeekKey(now, timeZone)
  return completion.monthKey === toMonthKey(now, timeZone)
}

function toEntry(uid: string, data: DocumentData, points: number): LeaderboardEntry {
  const streak = (data.streak ?? {}) as Partial<HouseholdMember['streak']>

  return {
    uid,
    name: String(data.displayName ?? 'Homie friend'),
    streak: streak.current ?? 0,
    displayName: String(data.displayName ?? 'Homie friend'),
    avatarConfig: (data.avatarConfig as HouseholdMember['avatarConfig'] | null | undefined) ?? null,
    points,
  }
}

export function useLeaderboard(householdId?: string | null, timeZone = 'UTC'): LeaderboardState {
  const [period, setPeriod] = useState<LeaderboardPeriod>('day')
  const [selectedDate, setSelectedDate] = useState(() => ({
    timeZone,
    dateKey: toDateKey(new Date(), timeZone),
  }))
  const [members, setMembers] = useState<Array<{ uid: string; data: DocumentData }>>([])
  const [completions, setCompletions] = useState<DocumentData[]>([])
  const [isLoading, setIsLoading] = useState(() => !householdId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firestore || !householdId) return
    const db = firestore

    let membersLoaded = false
    let completionsLoaded = false
    const updateLoadingState = () => setIsLoading(!membersLoaded || !completionsLoaded)

    const unsubscribeMembers = onSnapshot(
      collection(db, 'households', householdId, 'members'),
      (snapshot) => {
        setMembers(
          snapshot.docs.map((memberDoc) => ({ uid: memberDoc.id, data: memberDoc.data() })),
        )
        membersLoaded = true
        updateLoadingState()
      },
      (cause) => setError(cause instanceof Error ? cause.message : 'Failed to load leaderboard.'),
    )

    const unsubscribeCompletions = onSnapshot(
      collection(db, 'households', householdId, 'taskCompletions'),
      (snapshot) => {
        setCompletions(snapshot.docs.map((completionDoc) => completionDoc.data()))
        completionsLoaded = true
        updateLoadingState()
      },
      (cause) =>
        setError(cause instanceof Error ? cause.message : 'Failed to load completion history.'),
    )

    return () => {
      unsubscribeMembers()
      unsubscribeCompletions()
    }
  }, [householdId])

  const now = new Date()
  const todayDateKey = toDateKey(now, timeZone)
  // A household loads asynchronously. Until then, discard the initial UTC key
  // instead of momentarily showing a date from a different home time zone.
  const selectedDateKey = selectedDate.timeZone === timeZone ? selectedDate.dateKey : todayDateKey
  const setPastOrTodayDateKey = (dateKey: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey) && dateKey <= todayDateKey) {
      setSelectedDate({ timeZone, dateKey })
    }
  }
  const pointsByUser = completions.reduce<Record<string, number>>((totals, completion) => {
    if (!isInSelectedPeriod(completion, period, now, selectedDateKey, timeZone)) return totals
    const userId = String(completion.userId ?? '')
    if (!userId) return totals
    totals[userId] = (totals[userId] ?? 0) + Number(completion.pointsAwarded ?? 0)
    return totals
  }, {})
  const hasActivity = Object.keys(pointsByUser).length > 0

  const entries = members
    .map((member) => toEntry(member.uid, member.data, pointsByUser[member.uid] ?? 0))
    .sort((a, b) => b.points - a.points)

  return {
    entries,
    isLoading,
    error,
    period,
    setPeriod,
    selectedDateKey,
    setSelectedDateKey: setPastOrTodayDateKey,
    todayDateKey,
    hasActivity,
  }
}
