import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore } from 'firebase-admin/firestore'

const BATCH_LIMIT = 500

// Runs at UTC midnight; week starts Sunday and month starts on the 1st, matching the
// dateKey/weekKey/monthKey conventions used client-side in useTaskCompletions.ts.
export const resetPeriodTotals = onSchedule(
  { schedule: 'every day 00:00', timeZone: 'UTC' },
  async () => {
    const db = getFirestore()
    const now = new Date()
    const isWeekStart = now.getUTCDay() === 0
    const isMonthStart = now.getUTCDate() === 1

    const membersSnapshot = await db.collectionGroup('members').get()
    if (membersSnapshot.empty) return

    const resetFields: Record<string, number> = { 'totals.dailyPoints': 0 }
    if (isWeekStart) resetFields['totals.weeklyPoints'] = 0
    if (isMonthStart) resetFields['totals.monthlyPoints'] = 0

    const docs = membersSnapshot.docs
    for (let start = 0; start < docs.length; start += BATCH_LIMIT) {
      const batch = db.batch()
      for (const memberDoc of docs.slice(start, start + BATCH_LIMIT)) {
        batch.update(memberDoc.ref, resetFields)
      }
      await batch.commit()
    }
  },
)
