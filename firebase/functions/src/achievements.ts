export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  icon: string
  criteria: {
    type: 'tasks' | 'streak' | 'level' | 'points'
    value: number
  }
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    key: 'first_task',
    title: 'First Bloom',
    description: 'Complete your first task.',
    icon: '🌱',
    criteria: { type: 'tasks', value: 1 },
  },
  {
    id: 'tasks_10',
    key: 'tasks_10',
    title: 'Dish Duty Dynamo',
    description: 'Complete 10 tasks.',
    icon: '🧼',
    criteria: { type: 'tasks', value: 10 },
  },
  {
    id: 'tasks_50',
    key: 'tasks_50',
    title: 'Homestead Hero',
    description: 'Complete 50 tasks.',
    icon: '🏆',
    criteria: { type: 'tasks', value: 50 },
  },
  {
    id: 'streak_7',
    key: 'streak_7',
    title: 'Weekend Warrior',
    description: 'Keep a 7-day streak.',
    icon: '🔥',
    criteria: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_14',
    key: 'streak_14',
    title: 'Streak Master',
    description: 'Keep a 14-day streak.',
    icon: '⚡',
    criteria: { type: 'streak', value: 14 },
  },
  {
    id: 'level_5',
    key: 'level_5',
    title: 'Cozy Veteran',
    description: 'Reach Level 5.',
    icon: '🎖️',
    criteria: { type: 'level', value: 5 },
  },
  {
    id: 'points_500',
    key: 'points_500',
    title: 'Household Legend',
    description: 'Earn 500 lifetime points.',
    icon: '👑',
    criteria: { type: 'points', value: 500 },
  },
]

export interface MemberProgress {
  taskCount: number
  streak: number
  level: number
  lifetimePoints: number
}

export function unlockableAchievements(
  unlockedIds: Set<string>,
  progress: MemberProgress,
): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => {
    if (unlockedIds.has(achievement.id)) return false
    const criteria = achievement.criteria
    switch (criteria.type) {
      case 'tasks':
        return progress.taskCount >= criteria.value
      case 'streak':
        return progress.streak >= criteria.value
      case 'level':
        return progress.level >= criteria.value
      case 'points':
        return progress.lifetimePoints >= criteria.value
    }
  })
}