# Plan: Fix Task Creation, Level/Streak Defaults, and Mocked UI Elements

## Overview

Five reported bugs, all traced to concrete causes in the codebase:

1. **Task creation doesn't work** — a Firestore security-rules bug blocks every membership-gated read/write (tasks, members, achievements, completions), not just task creation.
2. **New users start at "Level 4"** — `TodayPage` hardcodes the text `Lvl 4`, and `AppLayout`'s member-context fallback uses mocked seed data (Maya, level 4) instead of real defaults.
3. **New users start with a 5-day streak** — same two causes as #2 (`TodayPage` hardcodes `🔥 5 Days`; fallback mock data has `streak: 5`).
4. **Mocked "Leo & Sam completed 4 tasks" chip** — a static, hardcoded social-proof chip on `TodayPage` that isn't wired to any real data.
5. **Task assignee picker shows mocked names** — `CreateTaskForm`'s assignee list is a hardcoded array (`Anyone, Maya, Leo, Sam, Chloe`) instead of the real household's member list.

## Architecture

No architectural changes — this is a bug-fix pass across existing files. The fixes touch three layers already in place:

- **Firestore rules** (`firebase/firestore.rules`) — security predicate logic.
- **App shell / context** (`web/src/app/AppLayout.tsx`) — where real household members are mapped into the `MockMember` shape consumed by pages.
- **Pages/features** (`TodayPage.tsx`, `CreateTaskForm.tsx`, `ManageTasksPage.tsx`) — presentation and form wiring.

## Tech Stack

No new dependencies. Existing stack: React + TypeScript, Firebase Firestore + Security Rules, Vite.

## File Structure (files to modify — none new)

```
firebase/
  firestore.rules                              (fix isOwnHousehold predicate)
web/src/
  app/
    AppLayout.tsx                               (fix fallback member defaults)
    pages/
      TodayPage.tsx                             (remove hardcoded level/streak/chip)
      ManageTasksPage.tsx                        (pass real members to CreateTaskForm)
  features/
    tasks/
      CreateTaskForm.tsx                        (dynamic assignee list)
```

## Task Breakdown

### 1. Fix Firestore rules membership check (root cause of "task creation not working")

`firebase/firestore.rules`, `isOwnHousehold`:

```js
function isOwnHousehold(householdId) {
  return isSignedIn()
    && request.auth.uid in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.householdIds
    && householdId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.householdIds;
}
```

The first conjunct checks whether `request.auth.uid` (a user id) appears inside `householdIds` (an array of *household* ids). That will essentially never be true, so `isOwnHousehold` — and therefore `isMemberOf`, used to gate `tasks`, `members`, `taskCompletions`, `achievements`, and `unlockedAchievements` — always evaluates to `false` for real signed-in members. This blocks task creation (and task reads, completions, etc.) even for legitimate household members.

**Fix:** drop the bogus first conjunct and keep only the real membership check:

```js
function isOwnHousehold(householdId) {
  return isSignedIn()
    && householdId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.householdIds;
}
```

Verify against existing rules tests/emulator if present; otherwise manually confirm via the Firebase emulator that a member of a household can now create/read tasks while a non-member is still denied.

### 2. Remove hardcoded level/streak/social chip from `TodayPage`

`web/src/app/pages/TodayPage.tsx`:
- Replace the hardcoded `Lvl 4` badge and `🔥 5 Days` streak pill with real values. Mirror the pattern already used in `ProfilePage.tsx` (`currentMember?.level?.level ?? 1`, `currentMember?.streak?.current ?? 0`) — pull `currentMember` from `useHousehold()` here as well, with **sane defaults (level 1, streak 0)**, not the mocked Maya values.
- Delete the "Leo & Sam completed 4 tasks" social-proof `<section>` block entirely (the `flex items-center gap-3 rounded-3xl bg-lavender-100 ...` block with the "High Five" button), since it's static and not backed by real data. If a "recent activity" feature is wanted later, that's a separate feature request, not a bug fix.

### 3. Fix fallback member defaults in `AppLayout`

`web/src/app/AppLayout.tsx`, `membersForContext`:

```ts
const membersForContext = useMemo<MockMember[]>(() => {
  if (!activeHousehold || members.length === 0) return initialMembers
  ...
```

When a signed-in user has no household yet (or members haven't loaded), this falls back to `initialMembers` — the mocked seed data where "Maya" is `level: 4, streak: 5`. Any page reading `members[0]` (e.g., `ProfilePage`'s `maya = members[0]`) inherits these mocked stats before a real household exists.

**Fix:** keep `initialMembers` as the fallback only for the **fully logged-out / local-prototype** experience (no `user`), and use a neutral default member (level 1, streak 0, 0 points) when a real `user` is signed in but has no household/members loaded yet. Concretely, branch on `user` (already available in this component) in addition to `activeHousehold`/`members.length`.

### 4. Make `CreateTaskForm` assignee list dynamic

`web/src/features/tasks/CreateTaskForm.tsx` currently hardcodes:
```ts
const assignees = ['Anyone', 'Maya', 'Leo', 'Sam', 'Chloe']
```

**Fix:**
- Add a `members: { id: string; name: string }[]` (or reuse `MockMember[]`) prop to `CreateTaskFormProps`.
- Compute the assignee list as `['Anyone', ...members.map((m) => m.name)]` instead of the hardcoded array.
- Update the default `assignedTo` initial state to `'Anyone'` instead of the hardcoded `'Maya'` fallback (`initialTask?.assignee ?? 'Anyone'`), since `'Maya'` won't exist in a real household.

### 5. Wire real members into `CreateTaskForm` call sites

- `web/src/app/pages/TodayPage.tsx` already destructures `members` from `useAppMock()` — pass it to `<CreateTaskForm members={members} ... />`.
- `web/src/app/pages/ManageTasksPage.tsx` needs to destructure `members` from `useAppMock()` (currently not pulled in) and pass it to both `CreateTaskForm` usages (create dialog and edit dialog, if present).

Since `AppLayout`'s `membersForContext` (task 3) already maps real Firestore household members into this same `MockMember[]` shape, no new data-fetching is needed — just prop plumbing to `CreateTaskForm`.

### 6. Manual verification pass

- Sign in as a real user, create/join a household, and confirm:
  - Task creation succeeds and the new task appears for all members in real time.
  - A brand-new member shows Level 1 / 0-day streak, not Level 4 / 5 days.
  - The "Leo & Sam" chip is gone from Today page.
  - The task-creation assignee row shows "Anyone" + actual household member names only.
- Confirm the local/no-auth prototype mode (no sign-in) still renders sensibly using mock data (no crashes from removed fallback).

## Risks / Open Questions

- **Rules fix scope**: the `isOwnHousehold` fix is a real security-rule bug fix, not just a UI bug fix — deploying it changes access control behavior. Recommend testing thoroughly with the Firestore emulator (or a staging project) before deploying to production, and confirm no other code path relied on the old (broken) always-false behavior.
- **`ProfilePage`'s `maya = members[0]`**: this pattern assumes the first array element represents "me," which is fragile. Task 3 makes the fallback safer, but a more robust long-term fix would be for `ProfilePage`/`TodayPage` to rely solely on `currentMember` from `useHousehold()` rather than `members[0]` from mock context. Flagged here but left out of scope unless the user wants it addressed now.
- **"Recent activity" chip**: removing the "Leo & Sam completed 4 tasks" chip per the request is a straight deletion. If the team wants a *real* recent-activity feed later, that's a new feature, not part of this bug-fix plan.
- Need confirmation on whether Cloud Functions (`firebase/functions/src/*.ts`) also read `householdIds` in a way affected by the rules fix — they use the Admin SDK (bypasses rules), so no changes expected there, but worth a quick double-check during implementation.

## Suggested Next Step

Hand this plan to an implementation agent (e.g., switch to an agent/edit mode) to apply the six tasks above in order, starting with the Firestore rules fix (task 1) since it's the highest-impact and most independent change.
