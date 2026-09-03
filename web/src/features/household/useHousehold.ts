import type { Household, HouseholdMember } from '../../types/models'

export interface HouseholdState {
  households: Household[]
  activeHousehold: Household | null
  members: HouseholdMember[]
  isLoading: boolean
}

export function useHousehold(): HouseholdState {
  return {
    households: [],
    activeHousehold: null,
    members: [],
    isLoading: false,
  }
}
