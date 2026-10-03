import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";

const BATCH_LIMIT = 500;

function validTimeZone(timeZone?: string): string {
  if (!timeZone) return "UTC";
  try {
    new Intl.DateTimeFormat(undefined, { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}

function localDateParts(
  date: Date,
  timeZone: string,
): { dateKey: string; weekday: number; day: number; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: validTimeZone(timeZone),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
      weekday: "short",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
  return {
    dateKey,
    weekday: new Date(`${dateKey}T00:00:00.000Z`).getUTCDay(),
    day: Number(parts.day),
    hour: Number(parts.hour),
  };
}

// One global hourly job lets each home reset at its own local midnight. The date
// marker makes retries and later hourly invocations safe for every household.
export const resetPeriodTotals = onSchedule(
  { schedule: "every 60 minutes", timeZone: "UTC" },
  async () => {
    const db = getFirestore();
    const now = new Date();
    const householdsSnapshot = await db.collection("households").get();

    for (const householdDoc of householdsSnapshot.docs) {
      const household = householdDoc.data();
      const { dateKey, weekday, day, hour } = localDateParts(
        now,
        String(household.timeZone ?? "UTC"),
      );
      if (hour !== 0 || household.lastTotalsResetDate === dateKey) continue;

      const resetFields: Record<string, number | string> = {
        "totals.dailyPoints": 0,
      };
      if (weekday === 0) resetFields["totals.weeklyPoints"] = 0;
      if (day === 1) resetFields["totals.monthlyPoints"] = 0;

      const membersSnapshot = await householdDoc.ref
        .collection("members")
        .get();
      for (
        let start = 0;
        start < membersSnapshot.docs.length;
        start += BATCH_LIMIT - 1
      ) {
        const batch = db.batch();
        for (const memberDoc of membersSnapshot.docs.slice(
          start,
          start + BATCH_LIMIT - 1,
        )) {
          batch.update(memberDoc.ref, resetFields);
        }
        if (start === 0)
          batch.update(householdDoc.ref, { lastTotalsResetDate: dateKey });
        await batch.commit();
      }

      // Homes without members still record the reset, preventing repeated work.
      if (membersSnapshot.empty)
        await householdDoc.ref.update({ lastTotalsResetDate: dateKey });
    }
  },
);
