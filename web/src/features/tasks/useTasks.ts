import type { HouseholdTask } from '../../types/models'

export interface TasksState {
  tasks: HouseholdTask[]
  isLoading: boolean
  createTask: (input: Omit<HouseholdTask, 'id' | 'active' | 'createdBy'>) => Promise<void>
}

export function useTasks(): TasksState {
  return {
    tasks: [],
    isLoading: false,
    createTask: async () => undefined,
  }
}
