import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db as firestore } from '../../firebase/firebaseClient'
import type { Achievement } from '../../types/models'

export const ACHIEVEMENT_CATALOG: Achievement[] = [
  { id: 'first_task', key: 'first_task', title: 'First Bloom', description: 'Complete your first task.', icon: '🌱', criteria: { type: 'tasks', value: 1 } },
  { id: 'tasks_10', key: 'tasks_10', title: 'Dish Duty Dynamo', description: 'Complete 10 tasks.', icon: '🧼', criteria: { type: 'tasks', value: 10 } },
  { id: 'tasks_50', key: 'tasks_50', title: 'Homestead Hero', description: 'Complete 50 tasks.', icon: '🏆', criteria: { type: 'tasks', value: 50 } },
  { id: 'streak_7', key: 'streak_7', title: 'Weekend Warrior', description: 'Keep a 7-day streak.', icon: '🔥', criteria: { type: 'streak', value: 7 } },
  { id: 'streak_14', key: 'streak_14', title: 'Streak Master', description: 'Keep a 14-day streak.', icon: '⚡', criteria: { type: 'streak', value: 14 } },
  { id: 'level_5', key: 'level_5', title: 'Cozy Veteran', description: 'Reach Level 5.', icon: '🎖️', criteria: { type: 'level', value: 5 } },
  { id: 'points_500', key: 'points_500', title: 'Household Legend', description: 'Earn 500 lifetime points.', icon: '👑', criteria: { type: 'points', value: 500 } },
]

const MOCK_UNLOCKED = new Set(['first_task'])

export interface AchievementsState {
  achievements: Achievement[]
  unlockedIds: Set<string>
  isLoading: boolean
}

export function useAchievements(householdId?: string | null, uid?: string | null): AchievementsState {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(MOCK_UNLOCKED)
  const [isLoading, setIsLoading] = useState(() => !householdId || !uid)

  useEffect(() => {
    if (!firestore || !householdId || !uid) return
    const db = firestore

    const unsubscribe = onSnapshot(
      collection(db, 'households', householdId, 'members', uid, 'unlockedAchievements'),
      (snapshot) => {
        setUnlockedIds(new Set(snapshot.docs.map((doc) => doc.id)))
        setIsLoading(false)
      },
    )

    return unsubscribe
  }, [householdId, uid])

  return { achievements: ACHIEVEMENT_CATALOG, unlockedIds, isLoading }
}