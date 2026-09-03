import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db as firestore } from '../../firebase/firebaseClient'
import { initialAvatar } from '../../app/mockState'
import type { AvatarConfig } from '../../types/models'

function isAvatarConfig(value: unknown): value is AvatarConfig {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AvatarConfig>
  return (
    typeof candidate.skinTone === 'string' &&
    typeof candidate.hairStyle === 'string' &&
    typeof candidate.hairColor === 'string' &&
    typeof candidate.face === 'string' &&
    typeof candidate.outfit === 'string'
  )
}

export interface AvatarState {
  avatarConfig: AvatarConfig
  isLoading: boolean
  saving: boolean
  error: string | null
  setAvatarConfig: (config: AvatarConfig) => void
  saveAvatar: (config: AvatarConfig) => Promise<boolean>
}

export function useAvatar(): AvatarState {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(initialAvatar)
  const isLoading = !auth?.currentUser
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uid = auth?.currentUser?.uid

  useEffect(() => {
    if (!firestore || !uid) return

    const unsubscribe = onSnapshot(
      doc(firestore, 'users', uid),
      (snapshot) => {
        const data = snapshot.data()
        const savedConfig = data?.avatarConfig
        if (isAvatarConfig(savedConfig)) {
          setAvatarConfig(savedConfig)
        }
      },
      (cause) => setError(cause instanceof Error ? cause.message : 'Failed to load avatar.'),
    )
    return unsubscribe
  }, [uid])

  async function saveAvatar(config: AvatarConfig): Promise<boolean> {
    if (!firestore || !auth?.currentUser) {
      setError('You must sign in to save your avatar.')
      return false
    }

    const user = auth.currentUser
    setSaving(true)
    setError(null)
    try {
      await setDoc(doc(firestore, 'users', user.uid), { avatarConfig: config }, { merge: true })

      const userDoc = await getDoc(doc(firestore, 'users', user.uid))
      const activeHouseholdId = userDoc.data()?.activeHouseholdId as string | undefined
      if (activeHouseholdId) {
        await setDoc(
          doc(firestore, 'households', activeHouseholdId, 'members', user.uid),
          { avatarConfig: config },
          { merge: true },
        )
      }

      setAvatarConfig(config)
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save avatar.')
      return false
    } finally {
      setSaving(false)
    }
  }

  return {
    avatarConfig,
    isLoading,
    saving,
    error,
    setAvatarConfig,
    saveAvatar,
  }
}