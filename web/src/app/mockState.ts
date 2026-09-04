import { useOutletContext } from 'react-router-dom'
import type { AvatarConfig, HouseholdTask, TaskRecurrence } from '../types/models'

export interface MockMember {
  id: string
  name: string
  initials: string
  title: string
  points: number
  level: number
  streak: number
  color: string
}

export interface MockTask extends HouseholdTask {
  icon: string
  room: string
  due: string
  assignee: string
  category: 'cleaning' | 'plants' | 'supplies' | 'pets' | 'laundry'
  completed: boolean
  completedBy?: string
  completionCount?: number
}

export interface TaskDraft {
  title: string
  points: number
  recurrence: TaskRecurrence
  assignedTo?: string
  icon: string
  room: string
  repeatable: boolean
}

export interface AppMockContext {
  avatarConfig: AvatarConfig
  setAvatarConfig: (config: AvatarConfig) => void
  saveAvatar: (config: AvatarConfig) => Promise<boolean>
  avatarSaving: boolean
  householdName: string
  setHouseholdName: (name: string) => void
  joinCode: string
  members: MockMember[]
  tasks: MockTask[]
  toggleTask: (id: string) => void
  addTask: (draft: TaskDraft) => void
  updateTask: (id: string, draft: TaskDraft) => void
  deleteTask: (id: string) => void
}

export const initialMembers: MockMember[] = [
  { id: 'maya', name: 'Maya', initials: 'M', title: 'Living Room Legend', points: 420, level: 4, streak: 5, color: 'bg-coral-100' },
  { id: 'leo', name: 'Leo', initials: 'L', title: 'Dishwashing Dynamo', points: 480, level: 5, streak: 6, color: 'bg-honey-100' },
  { id: 'sam', name: 'Sam', initials: 'S', title: 'Trash Tamer', points: 310, level: 3, streak: 3, color: 'bg-mint-100' },
  { id: 'chloe', name: 'Chloe', initials: 'C', title: 'Plant Whisperer', points: 240, level: 2, streak: 4, color: 'bg-lavender-200' },
]

export const initialTasks: MockTask[] = [
  { id: 'dishes', title: 'Wash dinner dishes & wipe counters', points: 50, recurrence: 'daily', assignedTo: 'Maya', assignee: 'Maya', active: true, createdBy: 'maya', repeatable: false, icon: '🍽️', room: 'Kitchen', due: 'Due by 9:00 PM', category: 'cleaning', completed: false },
  { id: 'plants', title: 'Water indoor monsteras & succulents', points: 30, recurrence: 'daily', assignedTo: 'Chloe', assignee: 'Chloe', active: true, createdBy: 'chloe', repeatable: true, icon: '🪴', room: 'Living Room', due: 'Morning light window', category: 'plants', completed: true, completedBy: 'Maya', completionCount: 1 },
  { id: 'compost', title: 'Take out compost & recycling', points: 40, recurrence: 'weekly', assignedTo: undefined, assignee: 'Anyone', active: true, createdBy: 'sam', repeatable: false, icon: '♻️', room: 'Back Porch', due: 'Pickup tomorrow', category: 'supplies', completed: false },
  { id: 'pantry', title: 'Restock oat milk & coffee beans', points: 25, recurrence: 'once', assignedTo: undefined, assignee: 'Anyone', active: true, createdBy: 'leo', repeatable: false, icon: '☕', room: 'Pantry', due: 'Low stock alert', category: 'supplies', completed: false },
  { id: 'dog', title: 'Morning dog walk & feed Mochi', points: 40, recurrence: 'daily', assignedTo: 'Leo', assignee: 'Leo', active: true, createdBy: 'leo', repeatable: true, icon: '🐾', room: 'Front Door', due: 'Before 8:30 AM', category: 'pets', completed: true, completedBy: 'Leo', completionCount: 1 },
]

export const initialAvatar: AvatarConfig = {
  skinTone: '#ffdad4',
  hairStyle: 'buns',
  hairColor: '#ff7e67',
  face: 'wink',
  outfit: '#95f7bb',
  accessory: 'star',
}

export function useAppMock() {
  return useOutletContext<AppMockContext>()
}
