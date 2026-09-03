import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db as firestore } from '../../firebase/firebaseClient'

export interface OnboardingState {
  onboardingComplete: boolean | null
  displayName: string
  isLoading: boolean
  error: string | null
  saveDisplayName: (name: string) => Promise<boolean>
  completeOnboarding: () => Promise<boolean>
}

export function useOnboarding(uid?: string | null): OnboardingState {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(uid))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firestore || !uid) return

    const unsubscribe = onSnapshot(
      doc(firestore, 'users', uid),
      (snapshot) => {
        const data = snapshot.data()
        setOnboardingComplete(Boolean(data?.onboardingComplete))
        setDisplayName(String(data?.displayName ?? ''))
        setIsLoading(false)
      },
      (cause) => {
        setError(cause instanceof Error ? cause.message : 'Failed to load profile.')
        setIsLoading(false)
      },
    )

    return unsubscribe
  }, [uid])

  async function saveDisplayName(name: string): Promise<boolean> {
    if (!firestore || !uid) return false
    const trimmed = name.trim()
    if (!trimmed) return false
    try {
      await setDoc(doc(firestore, 'users', uid), { displayName: trimmed }, { merge: true })
      setDisplayName(trimmed)
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save display name.')
      return false
    }
  }

  async function completeOnboarding(): Promise<boolean> {
    if (!firestore || !uid) return false
    try {
      await setDoc(doc(firestore, 'users', uid), { onboardingComplete: true }, { merge: true })
      setOnboardingComplete(true)
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save profile.')
      return false
    }
  }

  return { onboardingComplete, displayName, isLoading, error, saveDisplayName, completeOnboarding }
}