import { useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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
  error: string | null
  signInWithPopup: (provider: 'google' | 'microsoft') => Promise<void>
  signOut: () => Promise<void>
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      return
    }

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
    try {
      const credential =
        provider === 'google' ? new GoogleAuthProvider() : new OAuthProvider('microsoft.com')
      const result = await signInWithPopup(auth, credential)
      const nextUser = toAuthUser(result.user)
      await ensureUserProfile(nextUser)
      setUser(nextUser)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign-in failed. Please try again.')
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
    error,
    signInWithPopup: signInWithPopupHandler,
    signOut: signOutHandler,
  }
}
