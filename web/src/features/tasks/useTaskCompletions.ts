import type { TaskCompletion } from '../../types/models'

export interface TaskCompletionsState {
  completions: TaskCompletion[]
  isLoading: boolean
  completeTask: (taskId: string) => Promise<void>
}

export function useTaskCompletions(): TaskCompletionsState {
  return {
    completions: [],
    isLoading: false,
    completeTask: async () => undefined,
  }
}
