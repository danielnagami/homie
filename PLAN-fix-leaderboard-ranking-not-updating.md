# Plan: Fix Leaderboard/Ranking Not Counting Points

## Overview

The leaderboard shows no points for you or any other household member, even though
the "Today's Chore Quest" screen appears to count XP correctly. This is explained by
where each number actually comes from:

- **"+X XP" on `TodayPage`** ([TodayPage.tsx](web/src/app/pages/TodayPage.tsx#L38)) is
  computed **entirely client-side**: `earnedXp = tasks.filter(completed).reduce(sum + task.points)`.
  It just sums the `points` of tasks the client has locally marked complete. It never
  reads `members/{uid}.totals` from Firestore, so it will "work" even if the scoring
  Cloud Function has never run.
- **The leaderboard** ([useLeaderboard.ts](web/src/features/leaderboard/useLeaderboard.ts#L25-L41))
  and **Lvl/streak badges** on `TodayPage` (`currentMember?.level`, `currentMember?.streak`)
  read `members/{uid}.totals`, `.level`, `.streak` — fields that [firestore.rules](firebase/firestore.rules#L48-L60)
  only allow the **Cloud Function** (Admin SDK, server-side) to write. Clients are
  blocked by rules from writing them directly.
- Those fields are written by exactly one place in the codebase: the
  `onTaskCompletionCreated` trigger in
  [onTaskCompletionCreated.ts](firebase/functions/src/onTaskCompletionCreated.ts#L91-L138),
  which fires on `households/{householdId}/taskCompletions/{completionId}` document creation.

Conclusion: your task completions are being written fine (that's why the local XP
counter and task-completed checkmarks work), but the `onTaskCompletionCreated` Cloud
Function is not running against your Firebase project (`homie-ca99a`, per
[.firebaserc](.firebaserc)) — most likely it was never deployed, or a deploy attempt
failed silently. Because it never runs, `totals`/`level`/`streak` never get written for
**any** member, which is exactly the "not counting mine, not counting others" symptom.

A secondary, smaller issue also exists once the function is deployed: `dailyPoints`/
`weeklyPoints`/`monthlyPoints` are only ever incremented, with no scheduled reset —
so the Day/Week/Month leaderboard tabs will keep accumulating instead of resetting.

## Architecture

No architectural change to the scoring model itself — the existing "clients write raw
completion facts, Cloud Function computes derived totals" design is sound and matches
[PLAN.md](PLAN.md#L61-L82). This plan is about (a) verifying/fixing deployment so the
existing function actually runs, and (b) adding the missing periodic reset so day/week/
month totals stay meaningful once scoring is live.

## Tech Stack

No new dependencies. Existing stack: Firebase Cloud Functions v2 (`firebase-functions`,
`firebase-admin`), Firestore, Firebase CLI (`firebase-tools`), already-present
`onSchedule` trigger type from `firebase-functions/v2/scheduler` (part of the installed
`firebase-functions` package, no install needed).

## File Structure (files to inspect/modify)

```
firebase/functions/
  src/
    index.ts                     (export the new scheduled reset function)
    resetPeriodTotals.ts          (NEW — scheduled reset of daily/weekly/monthly totals)
package.json                     (no change — firebase:deploy script already exists)
```

## Task Breakdown

### 1. Confirm whether `onTaskCompletionCreated` is actually deployed and running

Not a code change — a verification step, since the whole fix depends on this:

- In the Firebase Console for project `homie-ca99a` → **Functions**, confirm
  `onTaskCompletionCreated` (and `onTaskCompletionDeleted`) are listed, in the
  `us-central1` region, with no persistent error state.
- If nothing is listed: the function was never deployed. Cloud Functions v2 requires
  the **Blaze (pay-as-you-go) billing plan** — if the project is still on the free
  Spark plan, `firebase deploy --only functions` fails outright. Check the project's
  billing plan first, since this is the most common reason a v2 function silently
  never gets created.
- If it is listed: open its **Logs** tab and look for invocations around the times you
  completed tasks. If invocations exist but throw errors, capture the stack trace —
  that would point to a runtime bug rather than a deployment gap. If there are **no
  invocations at all** for your recent completions, the Firestore trigger path/region
  may be misconfigured, or the function was deployed from stale/older source.
- Cross-check in Firestore directly: open a recent doc under
  `households/{householdId}/taskCompletions/` and check its `processed` field. If it's
  missing or `false`, the function never successfully processed it — confirms the
  deploy/runtime gap described above.

### 2. Deploy (or redeploy) the functions codebase

Once billing/config is confirmed, deploy from the repo root:

```
npm run firebase:deploy
```

(defined in [package.json](package.json#L3), runs `firebase deploy --only firestore,functions`)
or from `firebase/functions`:

```
npm run deploy
```

(runs `tsc` then `firebase deploy --only functions`, per
[firebase/functions/package.json](firebase/functions/package.json#L11)).

After deploy, repeat a task completion and verify in Firestore that
`members/{uid}.totals.lifetimePoints` (and `dailyPoints`/`weeklyPoints`/`monthlyPoints`)
increments, and that `taskCompletions/{id}.processed` becomes `true`. Then confirm the
Leaderboard page updates.

### 3. Add a scheduled reset for `dailyPoints` / `weeklyPoints` / `monthlyPoints`

Currently nothing resets these fields (verified: no `onSchedule` trigger exists in
`firebase/functions/src`), so once functions are deployed, the Day/Week/Month tabs
will still be wrong long-term — they'll just keep growing forever instead of
reflecting "this week" or "today".

New file `firebase/functions/src/resetPeriodTotals.ts`:

- One `onSchedule` (UTC cron) function that runs daily (e.g. `every day 00:00`) and:
  - Always zeroes `totals.dailyPoints` for every member across every household.
  - Zeroes `totals.weeklyPoints` additionally when the run day is the start of the
    week (e.g. Monday, matching whatever week-start convention `toWeekKey` in
    [useTaskCompletions.ts](web/src/features/tasks/useTaskCompletions.ts#L1) already
    uses client-side — reuse/port that logic so client `weekKey`/`monthKey` generation
    and the server reset agree on boundaries).
  - Zeroes `totals.monthlyPoints` additionally on the 1st of the month.
- Iterate households via a collection-group or top-level `households` query, then
  batch-update each `members` subcollection (batched writes, chunked at Firestore's
  500-writes-per-batch limit).
- Export it from [index.ts](firebase/functions/src/index.ts#L8) alongside the existing
  exports.

### 4. Re-verify end-to-end after both fixes

- Complete a task as one household member, confirm their leaderboard entry updates
  live (via the existing `onSnapshot` in
  [useLeaderboard.ts](web/src/features/leaderboard/useLeaderboard.ts#L46-L58)).
- Have a second member complete a task, confirm their entry also updates and the sort
  order in `useLeaderboard.ts` reflects both.
- Let the scheduled reset run (or trigger it manually via the Cloud Scheduler console)
  and confirm `dailyPoints` resets to 0 while `lifetimePoints` is untouched.

## Risks / Open Questions

- **Billing plan**: if the project is on the Spark (free) plan, deploying Cloud
  Functions v2 will fail until upgraded to Blaze — confirm this first, since it's the
  single most likely explanation for "functions never ran."
- **Week/month boundary agreement**: the reset schedule must use the same week-start
  and month-start convention as `toWeekKey`/`toMonthKey` in `useTaskCompletions.ts`, or
  the leaderboard will reset at a different time than the labels ("Resets Sunday" /
  "Resets in 2d 8h" in `LeaderboardPage.tsx`) imply.
- **Cost**: a daily scheduled function plus reading/writing every member across every
  household is a small but nonzero recurring cost on Blaze — acceptable for this app's
  scale, but worth confirming there's no existing budget alert expectation.
- Once you confirm the actual deployment/logs state from Task 1, the concrete fix in
  Task 2 may turn out to be as simple as "just deploy" — the reset function (Task 3) is
  an independent, real gap regardless of what Task 1 finds.

## Suggested Next Step

Hand this off to an implementation agent to: (1) verify deployment/billing status,
(2) redeploy functions, (3) implement `resetPeriodTotals.ts`, and (4) validate with the
Firestore emulator or the real project before pushing to production.
