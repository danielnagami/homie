// One-off admin script: repairs households missing a joinCodes/{code} mapping doc.
// Run once with: GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> npm run backfill:join-codes
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp()
const db = getFirestore()

async function backfillJoinCodes(): Promise<void> {
  const householdsSnapshot = await db.collection('households').get()
  let repaired = 0

  for (const householdDoc of householdsSnapshot.docs) {
    const joinCode = String(householdDoc.data().joinCode ?? '')
    if (!joinCode) {
      console.warn(`Household ${householdDoc.id} has no joinCode field, skipping.`)
      continue
    }

    const joinCodeRef = db.doc(`joinCodes/${joinCode}`)
    const joinCodeSnapshot = await joinCodeRef.get()
    if (joinCodeSnapshot.exists) continue

    await joinCodeRef.set({ householdId: householdDoc.id })
    repaired += 1
    console.log(`Created missing joinCodes/${joinCode} -> ${householdDoc.id}`)
  }

  console.log(`Done. Repaired ${repaired} of ${householdsSnapshot.size} households.`)
}

backfillJoinCodes().catch((cause) => {
  console.error('Backfill failed:', cause)
  process.exitCode = 1
})
