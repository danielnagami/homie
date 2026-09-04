# Plan: Repeatable Tasks

## Overview
Today a household task can only be completed once per day (the `dateKey` on
`taskCompletions` is checked to flip a task between "pending" and "done").
This plan adds a `repeatable` flag to tasks so they can be completed multiple
times within their recurrence period (day for `daily`, week for `weekly`),
each completion awarding full points again, with no cap on repeats. `once`
tasks are never repeatable. The UI shows a running counter for repeatable
tasks instead of the current single checkmark toggle.

Confirmed scope (from stakeholder answers):
1. No limit on repeat count per period.
2. UI shows a counter with a "do it again" action.
3. Applies to both `daily` and `weekly` recurrences (not `once`).
4. Every completion — including repeats — awards full points.

## Architecture
- **Data model**: add `repeatable: boolean` to `HouseholdTask` (and its
  concrete implementations `MockTask` / `TaskRecord` / `TaskDraft`). No new
  Firestore subcollection is needed — `taskCompletions` already stores one
  document per completion, so the data layer already supports multiple
  completions per task; only the *rules that decide whether a new completion
  is allowed* need to change from "boolean toggle" to "always allow, count
  per period".
- **Completion counting becomes period-aware**: today `isCompletedByMe` only
  compares `dateKey`, which means a `weekly` task's completion state
  incorrectly resets every day. Since this code path must change anyway to
  support repeatable counting, it will be fixed to key off `dateKey` for
  `daily` tasks, `weekKey` for `weekly` tasks, and "any completion ever" for
  `once` tasks.
- **UI behavior split by `repeatable`**:
  - Non-repeatable: unchanged toggle (tap to complete, tap again to
    un-complete), now correctly period-aware for `weekly` tasks too.
  - Repeatable: tapping the action always records a new completion (never
    un-completes); the card shows a count badge (e.g. "3× today" / "2× this
    week"). A small secondary control still allows removing the *most recent*
    completion, to correct mistaken taps, reusing the existing delete-own-doc
    rule.
- **Points/XP**: `earnedXp` on the Today page currently sums `points` for
  tasks where `completed === true` (one-shot). It must instead sum
  `pointsAwarded` across all of today's completion docs, so repeats count
  correctly.
- **Cloud Function (`onTaskCompletionCreated`)**: no functional change
  required. It already awards points per completion doc and only special-cases
  `recurrence === 'once'` for duplicate prevention; streak logic already
  no-ops for a second completion on the same `dateKey`. This will be verified,
  not modified, unless testing surfaces an issue.
- **Firestore rules**: `tasks` create/update field allow-lists must include
  `repeatable`. `taskCompletions` rules are untouched (create/delete already
  support multiple docs per user/task).

## Tech Stack
No new dependencies. Uses existing React + TypeScript + Firestore
(`onSnapshot`/`addDoc`/`deleteDoc`) patterns already present in
[useTasks.ts](web/src/features/tasks/useTasks.ts) and
[useTaskCompletions.ts](web/src/features/tasks/useTaskCompletions.ts).

## File Structure
Modified files only (no new files expected):
- [web/src/types/models.ts](web/src/types/models.ts) — add `repeatable` to `HouseholdTask`.
- [firebase/firestore.rules](firebase/firestore.rules) — allow `repeatable` in tasks create/update.
- [web/src/features/tasks/useTasks.ts](web/src/features/tasks/useTasks.ts) — persist/read `repeatable`.
- [web/src/features/tasks/CreateTaskForm.tsx](web/src/features/tasks/CreateTaskForm.tsx) — add repeatable toggle, disabled for `once`.
- [web/src/features/tasks/useTaskCompletions.ts](web/src/features/tasks/useTaskCompletions.ts) — period-aware count helper, undo-last-completion.
- [web/src/features/tasks/TaskCard.tsx](web/src/features/tasks/TaskCard.tsx) — counter + "again" UI for repeatable tasks.
- [web/src/features/tasks/TaskList.tsx](web/src/features/tasks/TaskList.tsx) — thread new props through.
- [web/src/app/pages/TodayPage.tsx](web/src/app/pages/TodayPage.tsx) — period-aware counts, corrected XP sum, repeatable-aware handlers.
- [web/src/app/pages/ManageTasksPage.tsx](web/src/app/pages/ManageTasksPage.tsx) — thread repeatable-aware handlers for the local/mock fallback path.
- [web/src/app/mockState.ts](web/src/app/mockState.ts) — `MockTask`/`TaskDraft` gain `repeatable`/`completionCount`.
- [web/src/app/AppLayout.tsx](web/src/app/AppLayout.tsx) — local (mock) `toggleTask` branches on `repeatable`.

## Task Breakdown

1. **Model**: add `repeatable: boolean` to `HouseholdTask` in [models.ts](web/src/types/models.ts). No migration needed — existing Firestore docs missing the field are treated as `repeatable: false` via `??`/`Boolean(...)` defaults, same pattern already used for `active`/`assignedTo`.

2. **Firestore rules**: update the `tasks` `create`/`update` rules in [firestore.rules](firebase/firestore.rules) to include `repeatable` in the allowed field list (`create` already only checks `hasAll` on required fields, so it needs no change there; `update`'s `hasOnly(...)` allow-list must add `'repeatable'`).

3. **`useTasks.ts`**: extend `TaskRecord` with `repeatable?: boolean`, map it through `toMockTask` (default `false`), and pass it through in `createTask`/`updateTask` payloads.

4. **`TaskDraft`** (in [mockState.ts](web/src/app/mockState.ts)): add `repeatable: boolean`.

5. **`CreateTaskForm.tsx`**: add a toggle ("Allow multiple completions") wired to `repeatable` state; auto-force it to `false` and disable the control when `recurrence === 'once'`; include `repeatable` in the `onSave` payload.

6. **`useTaskCompletions.ts`**:
   - Add a period-key resolver: `daily` → `dateKey`, `weekly` → `weekKey`, `once` → no period filter (match by `taskId` only).
   - Replace/extend `isCompletedByMe` with a recurrence-aware version, and add `completionCountForPeriod(taskId, recurrence): number`.
   - Keep `completeTask` unchanged (always appends a new completion doc — this already works for repeats).
   - Add `undoLastCompletion(taskId, recurrence)` that deletes the most recent completion doc in the current period (reuses the existing "delete own completion" security rule), used both for un-completing a non-repeatable task and for correcting an accidental repeat.

7. **`TaskCard.tsx`**: accept `repeatable`/`completionCount` props; when `repeatable` is true, render a count badge (e.g. "3× today") and an "again" button that always triggers the add-completion action rather than a toggle; keep the existing checkmark toggle for non-repeatable tasks unchanged.

8. **`TaskList.tsx`**: thread the new props/handlers from parent pages down to `TaskCard` without other behavior changes.

9. **`TodayPage.tsx`**:
   - Compute each task's period completion count via `completionCountForPeriod` instead of a single boolean.
   - Fix `earnedXp` to sum `pointsAwarded` from today's completion docs (not `task.points` gated by a boolean), so repeats are counted.
   - Split `handleToggle` into the existing toggle path (non-repeatable) and a new "complete again" path (repeatable) that always calls `completeTask`.
   - Keep the mock-mode fallback (`toggleTask` from `mockState`) working for signed-out/demo use.

10. **`ManageTasksPage.tsx`**: mirror the repeatable-aware wiring for consistency in the local/mock fallback path (management screen mainly edits task definitions, but its `TaskCard` usage must still reflect the same completion UI).

11. **`mockState.ts` + `AppLayout.tsx`** (local/demo mode without Firestore): add `completionCount` to `MockTask`, seed sensible defaults in `initialTasks`; update the local `toggleTask` implementation so repeatable tasks increment `completionCount` (and points) without ever flipping back to "undone", while non-repeatable tasks keep the current toggle behavior.

12. **Verification pass** (no code change expected): re-read [onTaskCompletionCreated.ts](firebase/functions/src/onTaskCompletionCreated.ts) to confirm multiple same-day completions award points correctly and don't double-increment the streak, and that achievement unlock counting (`completionsSnapshot.size`) behaves acceptably now that repeats can inflate task counts (see risks below).

## Risks / Open Questions
- **Achievement inflation**: achievements keyed on raw completion count (e.g. "complete N tasks") will unlock faster once a task can be repeated without limit. Not addressed by this plan — flag for a follow-up decision (e.g. de-dupe by `taskId` per period for achievement purposes) if it turns out to be undesirable.
- **Weekly completion tracking fix is a side effect**: making `isCompletedByMe`/count logic period-aware also fixes a pre-existing bug where weekly tasks reset their "done" state every day. This is a behavior change beyond the literal ask; confirm it's welcome (it should be, since it was arguably broken before).
- **No cap enforcement**: per confirmed scope, there is intentionally no server-side or client-side limit on repeats per period. If this is later found to need a cap (e.g. anti-abuse), it would need a new rule/field.
- **Scale of client-side filtering**: `completionCountForPeriod` filters the already-subscribed `taskCompletions` snapshot in memory (same approach as today's `isCompletedByMe`). Fine at current household sizes; would need server-side aggregation if completion volume grows significantly.

---
**Suggested next step**: hand this plan off to an implementation agent/session to execute tasks 1–12 in order, running `web`'s existing type-check/lint after each file group (model → rules → hooks → UI) to catch integration issues early.
