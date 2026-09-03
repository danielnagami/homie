import type { HouseholdMember } from '../../types/models'

export interface LeaderboardEntry {
  rank: number
  member: HouseholdMember
  points: number
}

export interface LeaderboardState {
  entries: LeaderboardEntry[]
  isLoading: boolean
}

export function useLeaderboard(): LeaderboardState {
  return {
    entries: [],
    isLoading: false,
  }
}
