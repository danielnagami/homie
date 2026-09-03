import { useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  OAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase/firebaseClient'
import type { AvatarConfig } from '../../types/models'

export interface AuthUser {
  uid: string
  displayName: string
  email: string
  photoURL?: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isResolvingRedirect: boolean
  error: string | null
  signInWithPopup: (provider: 'google' | 'microsoft') => Promise<void>
  signOut: () => Promise<void>
}

// Installed/standalone PWAs often can't reliably use popup sign-in, so drive
// an explicit redirect flow there instead of relying on the SDK's fallback.
function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.('(display-mode: standalone)').matches === true || nav.standalone === true
}

function toFriendlyAuthError(cause: unknown): string {
  const code = (cause as { code?: string } | null)?.code
  if (code === 'auth/missing-initial-state' || code === 'auth/web-storage-unsupported') {
    return 'Your browser blocked the sign-in session. Try again in your device\'s default browser with cookies enabled, or turn off private/incognito mode.'
  }
  return cause instanceof Error ? cause.message : 'Sign-in failed. Please try again.'
}

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName ?? 'Homie friend',
    email: user.email ?? '',
    photoURL: user.photoURL ?? undefined,
  }
}

const defaultAvatarConfig: AvatarConfig = {
  skinTone: '#ffdad4',
  hairStyle: 'buns',
  hairColor: '#ff7e67',
  face: 'wink',
  outfit: '#95f7bb',
  accessory: 'star',
}

async function ensureUserProfile(user: AuthUser): Promise<void> {
  if (!db) return

  const profileRef = doc(db, 'users', user.uid)
  const existing = await getDoc(profileRef)
  if (existing.exists()) return

  await setDoc(profileRef, {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL ?? null,
    avatarConfig: defaultAvatarConfig,
    householdIds: [],
    onboardingComplete: false,
  })
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(auth))
  const [isResolvingRedirect, setIsResolvingRedirect] = useState(() => Boolean(auth))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setIsResolvingRedirect(false)
      return
    }

    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return
        const nextUser = toAuthUser(result.user)
        await ensureUserProfile(nextUser)
        setUser(nextUser)
      })
      .catch((cause) => {
        setError(toFriendlyAuthError(cause))
      })
      .finally(() => {
        setIsResolvingRedirect(false)
      })

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const nextUser = toAuthUser(firebaseUser)
        await ensureUserProfile(nextUser)
        setUser(nextUser)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  async function signInWithPopupHandler(provider: 'google' | 'microsoft') {
    if (!auth || !db) {
      setError('Firebase is not configured. Copy web/.env.example to web/.env.local and fill it in.')
      return
    }

    setError(null)
    const credential =
      provider === 'google' ? new GoogleAuthProvider() : new OAuthProvider('microsoft.com')

    if (isStandalonePwa()) {
      try {
        await signInWithRedirect(auth, credential)
      } catch (cause) {
        setError(toFriendlyAuthError(cause))
      }
      return
    }

    try {
      const result = await signInWithPopup(auth, credential)
      const nextUser = toAuthUser(result.user)
      await ensureUserProfile(nextUser)
      setUser(nextUser)
    } catch (cause) {
      setError(toFriendlyAuthError(cause))
    }
  }

  async function signOutHandler() {
    if (!auth) return
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign-out failed.')
    }
  }

  return {
    user,
    isLoading,
    isResolvingRedirect,
    error,
    signInWithPopup: signInWithPopupHandler,
    signOut: signOutHandler,
  }
}
