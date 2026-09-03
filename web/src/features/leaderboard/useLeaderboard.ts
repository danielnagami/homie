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

function toEntry(uid: string, data: DocumentData, period: LeaderboardPeriod): LeaderboardEntry {
  const totals = (data.totals ?? {}) as Partial<HouseholdMember['totals']>
  const streak = (data.streak ?? {}) as Partial<HouseholdMember['streak']>
  const points =
    period === 'day'
      ? totals.dailyPoints ?? 0
      : period === 'week'
        ? totals.weeklyPoints ?? 0
        : totals.monthlyPoints ?? 0

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
  const [isLoading, setIsLoading] = useState(() => !householdId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firestore || !householdId) return
    const db = firestore

    const unsubscribe = onSnapshot(
      collection(db, 'households', householdId, 'members'),
      (snapshot) => {
        setMembers(snapshot.docs.map((memberDoc) => ({ uid: memberDoc.id, data: memberDoc.data() })))
        setIsLoading(false)
      },
      (cause) => setError(cause instanceof Error ? cause.message : 'Failed to load leaderboard.'),
    )

    return unsubscribe
  }, [householdId])

  const entries = members
    .map((member) => toEntry(member.uid, member.data, period))
    .sort((a, b) => b.points - a.points)

  return { entries, isLoading, error, period, setPeriod }
}