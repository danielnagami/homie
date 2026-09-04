export interface AvatarConfig {
  skinTone: string
  hairStyle: string
  hairColor: string
  face: string
  outfit: string
  accessory?: string
}

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  avatarConfig: AvatarConfig
  householdIds: string[]
  activeHouseholdId?: string
  onboardingComplete?: boolean
}

export interface Household {
  id: string
  name: string
  joinCode: string
  createdBy: string
  createdAt: string
  defaultPointsPerTask: number
}

export interface MemberTotals {
  lifetimePoints: number
  dailyPoints: number
  weeklyPoints: number
  monthlyPoints: number
}

export interface MemberStreak {
  current: number
  longest: number
  lastCompletedDate: string
}

export interface MemberLevel {
  level: number
  xp: number
  xpToNextLevel: number
}

export interface HouseholdMember {
  displayName: string
  avatarConfig: AvatarConfig
  joinedAt: string
  totals: MemberTotals
  streak: MemberStreak
  level?: MemberLevel
}

export type TaskRecurrence = 'daily' | 'weekly' | 'once'

export interface HouseholdTask {
  id: string
  title: string
  points: number
  recurrence: TaskRecurrence
  assignedTo?: string
  active: boolean
  createdBy: string
  repeatable: boolean
}

export interface TaskCompletion {
  id: string
  taskId: string
  userId: string
  completedAt: string
  dateKey: string
  pointsAwarded: number
  weekKey: string
  monthKey: string
}

export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  icon: string
  criteria: Record<string, unknown>
}

export interface UnlockedAchievement {
  unlockedAt: string
}
