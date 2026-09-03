# Plan: Fix "No household found with that code" on Join

## Overview
Users report that joining a household with a code that was genuinely
generated (visible in the creator's UI as `Created {name} ({joinCode})`)
fails with `No household found with that code.` This plan traces the root
cause(s) in the current implementation and lays out the fix.

## Root Cause Analysis

The join flow (`joinHousehold` in
[web/src/features/household/useHousehold.ts](web/src/features/household/useHousehold.ts))
resolves a code via a single-document lookup, `joinCodes/{code}`, then loads
`households/{householdId}`. This design (see
[PLAN-fix-household-permissions.md](PLAN-fix-household-permissions.md)) was
introduced specifically because Firestore security rules cannot authorize a
`where('joinCode', '==', ...)` query for a non-member — so the `joinCodes`
document is now the **only** path to resolving a code. If that document
doesn't exist, join always fails with this exact message, even though the
`households/{id}.joinCode` field the user is looking at is real.

Two concrete gaps currently allow a valid household to exist without a
matching `joinCodes/{code}` document:

1. **`createHousehold` is not atomic.** In
   [useHousehold.ts](web/src/features/household/useHousehold.ts) it performs,
   sequentially, `setDoc(households/{id})` → `setDoc(joinCodes/{code})` →
   `setDoc(households/{id}/members/{uid})` → `setDoc(users/{uid})`. If any
   step after the first `setDoc` throws (network blip, rules mismatch,
   browser tab closed/navigated mid-await, App Check token hiccup, etc.), the
   `households/{id}` document — including its `joinCode` field — is already
   persisted, but `joinCodes/{code}` was never written. The creator sees an
   error and may retry, generating a *different* code and a second orphaned
   household, or may have already shared the code with roommates before
   noticing. Either way, the code is real but unresolvable.
2. **No backfill for pre-existing households.** The original permissions fix
   (task 5 in `PLAN-fix-household-permissions.md`) explicitly flagged that any
   household created *before* the `joinCodes` collection existed has no
   mapping document, and left backfilling as an open, unresolved risk. Any
   household from that earlier window is permanently unjoinable by code today.

A third, lower-probability but easy-to-rule-out possibility is that the
deployed Firestore rules don't match
[firebase/firestore.rules](firebase/firestore.rules) in the repo (i.e. the
`joinCodes` rules were never deployed to the live project), which would make
every `joinCodes` create fail — producing the same orphaned-household
symptom for *every* new household, not just intermittently.

## Architecture / Approach
1. Make household creation atomic using a single `writeBatch` (or
   `runTransaction`) covering `households/{id}`, `joinCodes/{code}`, and
   `households/{id}/members/{uid}`, so it's impossible for the household to
   exist without its join-code mapping. The `users/{uid}` update can remain a
   separate call (it's owner-authorized and idempotent/mergeable, so partial
   failure there doesn't orphan a code).
2. Add a defensive, admin-side backfill path for households that already
   exist without a `joinCodes` entry: a one-off script (using
   `firebase-admin`, which bypasses security rules) that scans all
   `households` documents and creates any missing `joinCodes/{joinCode}` →
   `{ householdId }` mapping.
3. Confirm the deployed Firestore rules match the repo copy (redeploy if in
   doubt) so the `joinCodes` collection's `create`/`get` rules are actually
   live.
4. Improve error surfacing in `joinHousehold` so a genuinely missing mapping
   (vs. a network/auth error) is distinguishable, to make future diagnosis
   faster.

## Tech Stack
No new dependencies. Uses the existing `firebase/firestore` client SDK
(`writeBatch`) and `firebase-admin` (already a transitive dependency of
Cloud Functions tooling) for the one-off backfill script.

## File Structure (changes only)
```
web/src/
  features/household/useHousehold.ts   (modify: atomic writeBatch in createHousehold; clearer error handling in joinHousehold)
scripts/                                (new, if not already present)
  backfill-join-codes.ts                (new: one-off admin-SDK script to create missing joinCodes docs)
firebase/
  firestore.rules                       (verify only — redeploy if drifted from repo)
```

## Task Breakdown

1. **Confirm deployed rules match the repo**
   - Check (with the user/ops access) whether
     [firebase/firestore.rules](firebase/firestore.rules) was actually
     deployed after the `joinCodes` collection was introduced. If uncertain,
     plan to run `firebase deploy --only firestore:rules` as part of the fix
     rollout — this rules out cause #3 before touching client code.

2. **Make `createHousehold` atomic**
   - In [useHousehold.ts](web/src/features/household/useHousehold.ts),
     replace the sequential `setDoc(households/{id})` /
     `setDoc(joinCodes/{code})` / `setDoc(members/{uid})` calls with a single
     `writeBatch(fs)` that stages all three writes and commits once. Keep the
     join-code-uniqueness `getDoc` retry loop as-is (reads can't be batched,
     and this part already worked correctly).
   - Keep the `users/{uid}` `setDoc` as a separate, subsequent call (already
     idempotent via `merge: true` + `arrayUnion`); if it fails, the household
     is still fully joinable by code, and the create flow's catch block can
     surface a distinct message ("Household created, but we couldn't add it
     to your profile — try again") instead of the generic failure message.

3. **Tighten error messaging in `joinHousehold`**
   - Keep the "No household found with that code." message for the genuine
     not-found case (`joinCodeSnapshot` or `householdSnapshot` missing).
   - Catch and surface Firestore permission/network errors from the `catch`
     block with a distinct message (e.g. "Something went wrong joining — try
     again.") so future reports can distinguish "code truly doesn't resolve"
     from "a request failed," which today both could look identical to a
     user just retrying.

4. **Write a one-off backfill script**
   - Add `scripts/backfill-join-codes.ts` (or similar), using
     `firebase-admin` with a service account, that:
     - Lists all `households/{id}` documents.
     - For each, checks whether `joinCodes/{household.joinCode}` exists.
     - If missing, creates it with `{ householdId: household.id }`.
   - Document how to run it once (`ts-node scripts/backfill-join-codes.ts`
     with `GOOGLE_APPLICATION_CREDENTIALS` set) against the target project.
   - This is a manual, one-time operational step, not part of the app's
     runtime code path.

5. **Manual verification**
   - Fresh household creation still writes `households`, `joinCodes`, and
     `members` docs; force a mid-sequence failure (e.g. temporarily break the
     `members` write rule in a local emulator) and confirm the batch fails
     *before* any partial write lands, rather than leaving an orphaned
     household.
   - Run the backfill script against a copy/emulator with a manually created
     "orphaned" household (one with no `joinCodes` doc) and confirm it gets
     repaired, then confirm `joinHousehold` succeeds for its code afterward.
   - Confirm joining with a code from a household created after this fix
     works end-to-end for a second account.

## Risks / Open Questions
- **Do we know whether the deployed rules are current?** This should be
  confirmed with whoever manages the Firebase project before assuming the
  atomicity fix alone will resolve all reports — if rules are stale, no
  amount of client-side atomicity fixes the `joinCodes` write itself.
- **Scope of backfill**: is there real user data in the live project with
  affected households, or is this still pre-launch/test data that can be
  discarded instead of backfilled? This determines whether task 4 is
  necessary at all.
- **Batched writes and security rules**: `writeBatch` still evaluates rules
  per-document exactly like sequential writes (no `list`/query involved), so
  this change is a pure atomicity/consistency improvement, not a permissions
  change — no rules changes are required for task 2.
