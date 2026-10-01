// One-off admin script: remove earned progress while preserving tasks, households,
// memberships, user profiles, and avatar configurations.
// Run with: GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> npm run reset:earned-progress -- --project=homie-ca99a --confirm-reset-earned-progress
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, type Firestore, type QueryDocumentSnapshot } from 'firebase-admin/firestore'

const CONFIRMATION_FLAG = '--confirm-reset-earned-progress'
const PROJECT_PREFIX = '--project='
const BATCH_LIMIT = 400

function projectIdFromArgs(): string {
  const argument = process.argv.find((value) => value.startsWith(PROJECT_PREFIX))
  return argument?.slice(PROJECT_PREFIX.length) ?? ''
}

async function deleteSnapshots(db: Firestore, docs: QueryDocumentSnapshot[], label: string): Promise<number> {
  let deleted = 0
  for (let start = 0; start < docs.length; start += BATCH_LIMIT) {
    const batch = db.batch()
    for (const snapshot of docs.slice(start, start + BATCH_LIMIT)) batch.delete(snapshot.ref)
    await batch.commit()
    deleted += Math.min(BATCH_LIMIT, docs.length - start)
  }
  console.log(`Deleted ${deleted} ${label}.`)
  return deleted
}

async function resetEarnedProgress(): Promise<void> {
  if (!process.argv.includes(CONFIRMATION_FLAG)) {
    throw new Error(`Refusing to reset progress. Re-run with ${CONFIRMATION_FLAG}.`)
  }
  const projectId = projectIdFromArgs()
  if (!projectId) {
    throw new Error('Refusing to reset progress without an explicit --project=<firebase-project-id>.')
  }

  initializeApp({ projectId })
  const db = getFirestore()

  const [completionSnapshot, achievementSnapshot, memberSnapshot] = await Promise.all([
    db.collectionGroup('taskCompletions').get(),
    db.collectionGroup('unlockedAchievements').get(),
    db.collectionGroup('members').get(),
  ])

  const completions = await deleteSnapshots(db, completionSnapshot.docs, 'task completions')
  const achievements = await deleteSnapshots(db, achievementSnapshot.docs, 'achievement unlocks')

  let members = 0
  for (let start = 0; start < memberSnapshot.docs.length; start += BATCH_LIMIT) {
    const batch = db.batch()
    for (const member of memberSnapshot.docs.slice(start, start + BATCH_LIMIT)) {
      batch.update(member.ref, {
        totals: FieldValue.delete(),
        streak: FieldValue.delete(),
        level: FieldValue.delete(),
      })
    }
    await batch.commit()
    members += Math.min(BATCH_LIMIT, memberSnapshot.docs.length - start)
  }

  console.log(`Cleared earned-progress fields for ${members} members.`)
  console.log(`Reset complete: ${completions} completions and ${achievements} achievement unlocks removed.`)
}

resetEarnedProgress().catch((cause: unknown) => {
  console.error('Earned-progress reset failed:', cause)
  process.exitCode = 1
})
