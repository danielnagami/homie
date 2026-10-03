import { useCallback, useEffect, useState } from 'react'
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { auth, db as firestore } from '../../firebase/firebaseClient'
import type { Household, HouseholdMember } from '../../types/models'
import type { HomeLocation } from './homeLocations'

function generateJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let index = 0; index < 6; index += 1) {
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }
  return code
}

export type HouseholdMemberWithId = HouseholdMember & { id: string }

export interface HouseholdState {
  households: Household[]
  activeHousehold: Household | null
  members: HouseholdMemberWithId[]
  currentMember: HouseholdMember | null
  isLoading: boolean
  error: string | null
  createHousehold: (name: string, location: HomeLocation) => Promise<Household | null>
  joinHousehold: (code: string) => Promise<Household | null>
}

function toHousehold(id: string, data: Record<string, unknown>): Household {
  return {
    id,
    name: String(data.name ?? ''),
    joinCode: String(data.joinCode ?? ''),
    createdBy: String(data.createdBy ?? ''),
    createdAt: String(data.createdAt ?? ''),
    defaultPointsPerTask: Number(data.defaultPointsPerTask ?? 10),
    location: String(data.location ?? 'Home location'),
    timeZone: String(data.timeZone ?? 'UTC'),
  }
}

export function useHousehold(): HouseholdState {
  const [households, setHouseholds] = useState<Household[]>([])
  const [activeHousehold, setActiveHousehold] = useState<Household | null>(null)
  const [members, setMembers] = useState<HouseholdMemberWithId[]>([])
  const [currentMember, setCurrentMember] = useState<HouseholdMember | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(auth?.currentUser))
  const [error, setError] = useState<string | null>(null)

  const uid = auth?.currentUser?.uid

  useEffect(() => {
    if (!firestore || !uid) return

    const fs = firestore
    const unsubscribeUser = onSnapshot(
      doc(fs, 'users', uid),
      (snapshot) => {
        const data = snapshot.data()
        const ids: string[] = (data?.householdIds as string[]) ?? []
        const activeId = data?.activeHouseholdId as string | undefined

        void Promise.all(ids.map((householdId) => getDoc(doc(fs, 'households', householdId)))).then(
          (docs) => {
            const loaded = docs
              .filter((householdDoc) => householdDoc.exists())
              .map((householdDoc) => toHousehold(householdDoc.id, householdDoc.data()))

            setHouseholds(loaded)
            const active = loaded.find((item) => item.id === activeId) ?? loaded[0] ?? null
            setActiveHousehold(active)
            setIsLoading(false)
          },
        )
      },
      (cause) => setError(cause instanceof Error ? cause.message : 'Failed to load household.'),
    )

    return unsubscribeUser
  }, [uid])

  useEffect(() => {
    if (!firestore || !activeHousehold) return

    const fs = firestore
    const myUid = uid
    const unsubscribeMembers = onSnapshot(
      collection(fs, 'households', activeHousehold.id, 'members'),
      (snapshot) => {
        const loaded = snapshot.docs.map((memberDoc) => {
          const data = memberDoc.data()
          return {
            id: memberDoc.id,
            displayName: String(data.displayName ?? ''),
            avatarConfig: data.avatarConfig as HouseholdMember['avatarConfig'],
            joinedAt: String(data.joinedAt ?? ''),
            totals: data.totals as HouseholdMember['totals'],
            streak: data.streak as HouseholdMember['streak'],
            level: data.level as HouseholdMember['level'] | undefined,
          }
        })
        setMembers(loaded)
        setCurrentMember(loaded.find((_, index) => snapshot.docs[index]?.id === myUid) ?? null)
      },
    )

    return unsubscribeMembers
  }, [activeHousehold, uid])

  const createHousehold = useCallback(
    async (name: string, location: HomeLocation): Promise<Household | null> => {
      if (!firestore || !auth?.currentUser) {
        setError('You must sign in to create a household.')
        return null
      }

      const fs = firestore
      const user = auth.currentUser
      setError(null)
      try {
        let joinCode = generateJoinCode()
        let joinCodeSnapshot = await getDoc(doc(fs, 'joinCodes', joinCode))
        while (joinCodeSnapshot.exists()) {
          joinCode = generateJoinCode()
          joinCodeSnapshot = await getDoc(doc(fs, 'joinCodes', joinCode))
        }

        const householdsCollection = collection(fs, 'households')
        const householdRef = doc(householdsCollection)
        const now = new Date().toISOString()

        // Batch these so a partial failure never leaves a household without its joinCodes mapping.
        const batch = writeBatch(fs)
        batch.set(householdRef, {
          name: name.trim() || 'Cozy Cottage',
          joinCode,
          createdBy: user.uid,
          createdAt: now,
          defaultPointsPerTask: 10,
          location: location.label,
          timeZone: location.timeZone,
        })
        batch.set(doc(fs, 'joinCodes', joinCode), { householdId: householdRef.id })
        batch.set(doc(householdsCollection, householdRef.id, 'members', user.uid), {
          displayName: user.displayName ?? 'Homie friend',
          avatarConfig: null,
          joinedAt: now,
        })
        await batch.commit()

        const household: Household = {
          id: householdRef.id,
          name: name.trim() || 'Cozy Cottage',
          joinCode,
          createdBy: user.uid,
          createdAt: now,
          defaultPointsPerTask: 10,
          location: location.label,
          timeZone: location.timeZone,
        }

        setActiveHousehold(household)
        setHouseholds((current) => [...current, household])

        try {
          await setDoc(
            doc(fs, 'users', user.uid),
            { householdIds: arrayUnion(householdRef.id), activeHouseholdId: householdRef.id },
            { merge: true },
          )
        } catch {
          setError("Household created, but we couldn't add it to your profile. Try again.")
        }

        return household
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Failed to create household.')
        return null
      }
    },
    [],
  )

  const joinHousehold = useCallback(async (code: string): Promise<Household | null> => {
    if (!firestore || !auth?.currentUser) {
      setError('You must sign in to join a household.')
      return null
    }

    const fs = firestore
    const user = auth.currentUser
    setError(null)
    try {
      const joinCodeSnapshot = await getDoc(doc(fs, 'joinCodes', code.trim().toUpperCase()))
      if (!joinCodeSnapshot.exists()) {
        setError('No household found with that code.')
        return null
      }

      const householdId = String(joinCodeSnapshot.data().householdId ?? '')
      const householdSnapshot = await getDoc(doc(fs, 'households', householdId))
      if (!householdSnapshot.exists()) {
        setError('No household found with that code.')
        return null
      }

      const household = toHousehold(householdSnapshot.id, householdSnapshot.data())
      const now = new Date().toISOString()

      await setDoc(doc(collection(fs, 'households', household.id, 'members'), user.uid), {
        displayName: user.displayName ?? 'Homie friend',
        avatarConfig: null,
        joinedAt: now,
      })

      await setDoc(
        doc(fs, 'users', user.uid),
        { householdIds: arrayUnion(household.id), activeHouseholdId: household.id },
        { merge: true },
      )

      setActiveHousehold(household)
      setHouseholds((current) =>
        current.some((item) => item.id === household.id) ? current : [...current, household],
      )
      return household
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to join household.')
      return null
    }
  }, [])

  return {
    households,
    activeHousehold,
    members,
    currentMember,
    isLoading,
    error,
    createHousehold,
    joinHousehold,
  }
}
