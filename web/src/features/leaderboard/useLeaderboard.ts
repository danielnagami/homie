import { useEffect, useState } from 'react'
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore'
import { db as firestore } from '../../firebase/firebaseClient'
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
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function toWeekKey(date: Date): string {
  const start = new Date(date)
  start.setUTCDate(start.getUTCDate() - start.getUTCDay())
  return toDateKey(start)
}

function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function isInCurrentPeriod(completion: DocumentData, period: LeaderboardPeriod, now: Date): boolean {
  if (period === 'day') return completion.dateKey === toDateKey(now)
  if (period === 'week') return completion.weekKey === toWeekKey(now)
  return completion.monthKey === toMonthKey(now)
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

export function useLeaderboard(householdId?: string | null): LeaderboardState {
  const [period, setPeriod] = useState<LeaderboardPeriod>('week')
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
        setMembers(snapshot.docs.map((memberDoc) => ({ uid: memberDoc.id, data: memberDoc.data() })))
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
      (cause) => setError(cause instanceof Error ? cause.message : 'Failed to load completion history.'),
    )

    return () => {
      unsubscribeMembers()
      unsubscribeCompletions()
    }
  }, [householdId])

  const now = new Date()
  const pointsByUser = completions.reduce<Record<string, number>>((totals, completion) => {
    if (!isInCurrentPeriod(completion, period, now)) return totals
    const userId = String(completion.userId ?? '')
    if (!userId) return totals
    totals[userId] = (totals[userId] ?? 0) + Number(completion.pointsAwarded ?? 0)
    return totals
  }, {})

  const entries = members
    .map((member) => toEntry(member.uid, member.data, pointsByUser[member.uid] ?? 0))
    .sort((a, b) => b.points - a.points)

  return { entries, isLoading, error, period, setPeriod }
}
