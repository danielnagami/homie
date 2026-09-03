export interface AuthUser {
  uid: string
  displayName: string
  email: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  signInWithPopup: (provider: 'google' | 'microsoft') => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  return {
    user: null,
    isLoading: false,
    signInWithPopup: async () => undefined,
    signOut: async () => undefined,
  }
}
