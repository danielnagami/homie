import {
  onDocumentCreated,
  onDocumentDeleted,
} from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import type {
  DocumentData,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import { levelForXp } from "./leveling.js";
import { unlockableAchievements } from "./achievements.js";
import {
  previousDateKey,
  streakFromCompletionDates,
} from "./earnedProgress.js";

interface CompletionData {
  taskId: string;
  userId: string;
  completedAt?: string | Timestamp;
  dateKey?: string;
  pointsAwarded?: number;
  weekKey?: string;
  monthKey?: string;
  processed?: boolean;
}

function validTimeZone(timeZone?: string): string {
  if (!timeZone) return "UTC";
  try {
    new Intl.DateTimeFormat(undefined, { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}

function toDateKey(date: Date, timeZone = "UTC"): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: validTimeZone(timeZone),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function toWeekKey(date: Date, timeZone = "UTC"): string {
  const dateKey = toDateKey(date, timeZone);
  const start = new Date(`${dateKey}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return start.toISOString().slice(0, 10);
}

function toMonthKey(date: Date, timeZone = "UTC"): string {
  return toDateKey(date, timeZone).slice(0, 7);
}

interface TaskData {
  title?: string;
  points?: number;
  recurrence?: "daily" | "weekly" | "once";
  assignedTo?: string | null;
  active?: boolean;
  createdBy?: string;
}

export const onTaskCompletionCreated = onDocumentCreated(
  "households/{householdId}/taskCompletions/{completionId}",
  async (event) => {
    const householdId = event.params.householdId;
    const completionId = event.params.completionId;
    const completion = event.data;
    if (!completion) return;

    const data = completion.data() as CompletionData;
    const taskId = data.taskId;
    const userId = data.userId;
    const points = Number(data.pointsAwarded ?? 0);
    const processedKey = "processed";

    const db = getFirestore();
    const completionRef = db.doc(
      `households/${householdId}/taskCompletions/${completionId}`,
    );
    const householdRef = db.doc(`households/${householdId}`);
    const taskRef = db.doc(`households/${householdId}/tasks/${taskId}`);
    const memberRef = db.doc(`households/${householdId}/members/${userId}`);

    if (!userId || !taskId) return;

    await db.runTransaction(async (transaction) => {
      const processedDoc = await transaction.get(completionRef);
      if (processedDoc.exists && processedDoc.data()?.processed === true) {
        logger.info("onTaskCompletionCreated: skip already-processed", {
          householdId,
          completionId,
          taskId,
          userId,
        });
        return;
      }

      const taskSnapshot = await transaction.get(taskRef);
      const householdSnapshot = await transaction.get(householdRef);
      const timeZone = validTimeZone(
        String(householdSnapshot.data()?.timeZone ?? "UTC"),
      );
      const dateKey = data.dateKey ?? toDateKey(new Date(), timeZone);
      if (!taskSnapshot.exists) {
        logger.warn("onTaskCompletionCreated: skip task-missing", {
          householdId,
          completionId,
          taskId,
          userId,
        });
        await transaction.update(completionRef, {
          [processedKey]: true,
          processedReason: "task-missing",
        });
        return;
      }

      const task = taskSnapshot.data() as TaskData;
      if (task.active === false) {
        logger.warn("onTaskCompletionCreated: skip task-inactive", {
          householdId,
          completionId,
          taskId,
          userId,
        });
        await transaction.update(completionRef, {
          [processedKey]: true,
          processedReason: "task-inactive",
        });
        return;
      }

      if (task.recurrence === "once") {
        const duplicates = await db
          .collection(`households/${householdId}/taskCompletions`)
          .where("taskId", "==", taskId)
          .limit(2)
          .get();
        if (duplicates.size > 1) {
          logger.warn("onTaskCompletionCreated: skip once-duplicate", {
            householdId,
            completionId,
            taskId,
            userId,
          });
          await transaction.update(completionRef, {
            [processedKey]: true,
            processedReason: "once-duplicate",
          });
          return;
        }
      }

      const memberSnapshot = await transaction.get(memberRef);
      const memberNow = memberSnapshot.exists ? memberSnapshot.data() : null;
      const streak = (memberNow?.streak ?? {}) as Record<
        string,
        number | string
      >;
      // households/join create the member doc up front (displayName/avatarConfig/joinedAt only),
      // so `memberSnapshot.exists` is true well before gamification fields are ever set.
      const hasGamificationFields = Boolean(memberNow?.totals);

      const increment = FieldValue.increment(points);

      const newTotals = {
        lifetimePoints: increment,
        dailyPoints: increment,
        weeklyPoints: increment,
        monthlyPoints: increment,
      };

      if (!hasGamificationFields) {
        const initialLevel = levelForXp(points);
        transaction.set(
          memberRef,
          {
            totals: {
              lifetimePoints: points,
              dailyPoints: points,
              weeklyPoints: points,
              monthlyPoints: points,
            },
            streak: { current: 1, longest: 1, lastCompletedDate: dateKey },
            level: {
              level: initialLevel.level,
              xp: points,
              xpIntoLevel: initialLevel.xpIntoLevel,
              xpToNextLevel: initialLevel.xpToNextLevel,
            },
          },
          { merge: true },
        );
      } else {
        const lastCompletedDate = String(streak.lastCompletedDate ?? "");
        let currentStreak = Number(streak.current ?? 0);
        let longestStreak = Number(streak.longest ?? 0);

        if (lastCompletedDate === dateKey) {
          // Same day, keep current streak.
        } else if (
          lastCompletedDate &&
          previousDateKey(dateKey) === lastCompletedDate
        ) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
        longestStreak = Math.max(longestStreak, currentStreak);

        const memberTotals = (memberNow?.totals ?? {}) as Record<
          string,
          number
        >;
        const lifetimeBefore = Number(memberTotals.lifetimePoints ?? 0);
        const lifetimeAfter = lifetimeBefore + points;
        const levelState = levelForXp(lifetimeAfter);

        transaction.update(memberRef, {
          totals: newTotals,
          streak: {
            current: currentStreak,
            longest: longestStreak,
            lastCompletedDate: dateKey,
          },
          level: {
            level: levelState.level,
            xp: lifetimeAfter,
            xpIntoLevel: levelState.xpIntoLevel,
            xpToNextLevel: levelState.xpToNextLevel,
          },
        });
      }

      await transaction.update(completionRef, { [processedKey]: true });
      logger.info("onTaskCompletionCreated: awarded points", {
        householdId,
        completionId,
        taskId,
        userId,
        points,
      });
    });

    void checkAchievements(db, householdId, userId, memberRef);
  },
);

async function checkAchievements(
  db: ReturnType<typeof getFirestore>,
  householdId: string,
  userId: string,
  memberRef: DocumentReference<DocumentData>,
): Promise<void> {
  if (!userId) return;

  const [memberSnapshot, completionsSnapshot, unlockedSnapshot] =
    await Promise.all([
      memberRef.get(),
      db
        .collection(`households/${householdId}/taskCompletions`)
        .where("userId", "==", userId)
        .get(),
      db
        .collection(
          `households/${householdId}/members/${userId}/unlockedAchievements`,
        )
        .get(),
    ]);

  const memberData = memberSnapshot.exists ? memberSnapshot.data() : null;
  const levelState = (memberData?.level ?? {}) as Record<string, number>;
  const totals = (memberData?.totals ?? {}) as Record<string, number>;
  const unlockable = unlockableAchievements(
    new Set(unlockedSnapshot.docs.map((doc) => doc.id)),
    {
      taskCount: completionsSnapshot.size,
      streak: Number(
        (memberData?.streak as Record<string, number> | undefined)?.current ??
          0,
      ),
      level: levelState.level ?? 1,
      lifetimePoints: totals.lifetimePoints ?? 0,
    },
  );

  await Promise.all(
    unlockable.map((achievement) =>
      db
        .doc(
          `households/${householdId}/members/${userId}/unlockedAchievements/${achievement.id}`,
        )
        .set({
          unlockedAt: new Date().toISOString(),
        }),
    ),
  );
}

export const onTaskCompletionDeleted = onDocumentDeleted(
  "households/{householdId}/taskCompletions/{completionId}",
  async (event) => {
    const householdId = event.params.householdId;
    const completion = event.data;
    if (!completion) return;

    const data = completion.data() as CompletionData;
    if (data.processed !== true) return;

    const userId = data.userId;
    const points = Number(data.pointsAwarded ?? 0);
    if (!userId) return;

    const db = getFirestore();
    const memberRef = db.doc(`households/${householdId}/members/${userId}`);
    const householdRef = db.doc(`households/${householdId}`);
    const remainingCompletionsQuery = db
      .collection(`households/${householdId}/taskCompletions`)
      .where("userId", "==", userId);

    await db.runTransaction(async (transaction) => {
      const [memberSnapshot, householdSnapshot, remainingCompletionsSnapshot] = await Promise.all([
        transaction.get(memberRef),
        transaction.get(householdRef),
        transaction.get(remainingCompletionsQuery),
      ]);
      if (!memberSnapshot.exists) return;

      const memberNow = memberSnapshot.data();
      const totals = (memberNow?.totals ?? {}) as Record<string, number>;
      const now = new Date();
      const timeZone = validTimeZone(
        String(householdSnapshot.data()?.timeZone ?? "UTC"),
      );
      const updates: Record<string, number> = {};
      const safePoints = Number.isFinite(points) ? points : 0;

      if (data.dateKey === toDateKey(now, timeZone)) {
        updates["totals.dailyPoints"] = Math.max(
          0,
          Number(totals.dailyPoints ?? 0) - safePoints,
        );
      }
      if (data.weekKey === toWeekKey(now, timeZone)) {
        updates["totals.weeklyPoints"] = Math.max(
          0,
          Number(totals.weeklyPoints ?? 0) - safePoints,
        );
      }
      if (data.monthKey === toMonthKey(now, timeZone)) {
        updates["totals.monthlyPoints"] = Math.max(
          0,
          Number(totals.monthlyPoints ?? 0) - safePoints,
        );
      }

      const lifetimePoints = Math.max(0, Number(totals.lifetimePoints ?? 0) - safePoints);
      const levelState = levelForXp(lifetimePoints);
      const completedDateKeys = new Set(
        remainingCompletionsSnapshot.docs
          .filter((completionSnapshot) => completionSnapshot.data().processed === true)
          .map((completionSnapshot) => String(completionSnapshot.data().dateKey ?? ""))
          .filter((dateKey) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey)),
      );

      transaction.update(memberRef, {
        ...updates,
        "totals.lifetimePoints": lifetimePoints,
        streak: streakFromCompletionDates(completedDateKeys),
        level: {
          level: levelState.level,
          xp: levelState.xp,
          xpIntoLevel: levelState.xpIntoLevel,
          xpToNextLevel: levelState.xpToNextLevel,
        },
      });
    });
  },
);
