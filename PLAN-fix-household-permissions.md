# Plan: Fix "Missing or insufficient permissions" on Create/Join Household

## Overview
When a user tries to create (or join) a household, Firestore throws
`FirebaseError: Missing or insufficient permissions`. This happens even though
the household document itself would satisfy the `create` rule — the failure
occurs earlier, during a **query** used to check join-code uniqueness /
resolve a join code, which Firestore's security rules cannot statically
authorize.

## Root Cause
[web/src/features/household/useHousehold.ts](web/src/features/household/useHousehold.ts) runs:

```ts
getDocs(query(collection(fs, 'households'), where('joinCode', '==', joinCode)))
```

- In `createHousehold` (lines ~127-132): to check the randomly generated join
  code isn't already taken.
- In `joinHousehold` (lines ~199-201): to resolve an invite code to a
  household.

The security rule for that collection in
[firebase/firestore.rules](firebase/firestore.rules) is:

```
match /households/{householdId} {
  allow read: if isMemberOf(householdId);
  ...
}
```

`isMemberOf(householdId)` depends only on the `householdId` path segment and
the caller's own `users/{uid}` membership list — it has no relationship to
the `joinCode` field being queried. Firestore validates **queries** (list
operations) by proving the rule holds for *every possible document* that
could satisfy the query filter, not just the documents actually returned. It
cannot prove that "any household whose `joinCode` equals X" is one the caller
is a member of, so it rejects the entire query up front with
`permission-denied` — regardless of whether the query would have returned 0
or 1 results. A brand-new user (member of no households) will **always** hit
this on both the create-time uniqueness check and the join flow.

This is a well-known Firestore rules limitation: `where()` queries can only
be secured by rules whose conditions are provably true across the whole
collection for the given filter, not by per-document/membership rules.

## Architecture / Approach
Introduce a small top-level lookup collection, `joinCodes/{code}`, that maps
an invite code to its `householdId`. Reads/writes against this collection are
always single-document `get`/`create` operations (never a filtered `list`),
so they can be secured with simple, provable rules. Split the `households`
collection's `read` rule into `get` (single document, needed to fetch
household details by a resolved ID) and `list` (kept membership-restricted,
so nobody can enumerate all households).

Flow after the fix:
1. **Create household**: generate a candidate code → `getDoc(joinCodes/{code})`
   to check uniqueness (single-doc get, always allowed for signed-in users) →
   if taken, retry → batch-write `households/{id}`, `joinCodes/{code}`, and
   `households/{id}/members/{uid}` together (atomic, same-shape validation as
   today) → update `users/{uid}`.
2. **Join household**: `getDoc(joinCodes/{code})` → resolve `householdId` →
   `getDoc(households/{householdId})` (allowed via the new `get` rule) →
   create membership doc → update `users/{uid}`.

## Tech Stack
No new dependencies — uses the existing `firebase/firestore` SDK
(`getDoc`, `writeBatch`/`runTransaction`) and Firestore Security Rules
already in use.

## File Structure (changes only)
```
firebase/
  firestore.rules                              (modify: split get/list, add joinCodes rules)
web/src/
  features/household/useHousehold.ts            (modify: replace where() queries with joinCodes lookups)
  types/models.ts                               (modify: add JoinCodeMapping type, optional)
```

## Task Breakdown

1. **Update `firestore.rules`**
   - Split `households/{householdId}` `allow read` into:
     - `allow get: if isSignedIn();` (any signed-in user can fetch a
       specific household by ID once they know it — needed for the join
       flow before membership exists).
     - `allow list: if isMemberOf(householdId);` (unchanged behavior:
       browsing/enumerating households still requires membership).
   - Add a new top-level `match /joinCodes/{code}` block:
     - `allow get: if isSignedIn();`
     - `allow create: if isSignedIn() && request.resource.data.keys().hasOnly(['householdId']) && request.resource.data.householdId is string;`
       (optionally also assert the referenced household's `createdBy`
       matches `request.auth.uid`, via `get()`, to stop code-squatting)
     - `allow update, delete: if false;` (codes are immutable once created)
   - Keep the existing `households/{householdId}` `create`, `update`,
     `delete`, and subcollection rules unchanged.

2. **Update `createHousehold` in `useHousehold.ts`**
   - Replace the `getDocs(query(..., where('joinCode', '==', joinCode)))`
     uniqueness loop with `getDoc(doc(fs, 'joinCodes', joinCode))` and retry
     while `.exists()`.
   - After generating the household ID, write `households/{id}`,
     `joinCodes/{joinCode}` (`{ householdId: householdRef.id }`), and
     `households/{id}/members/{uid}` using a `writeBatch` (or sequential
     `setDoc` calls as today, since each is independently authorized) to
     avoid a state where the household exists but its code mapping doesn't.

3. **Update `joinHousehold` in `useHousehold.ts`**
   - Replace the `where('joinCode', '==', code)` query with:
     `getDoc(doc(fs, 'joinCodes', code))` → if missing, "No household found
     with that code." → else `getDoc(doc(fs, 'households', mapping.householdId))`
     to load the household details (now permitted by the new `get` rule).

4. **(Optional) Add `JoinCodeMapping` type** in `models.ts` for the
   `{ householdId: string }` shape, for consistency with other typed reads.

5. **Deploy updated rules** (`firebase deploy --only firestore:rules`) —
   note existing households created under the old scheme won't have a
   `joinCodes` entry; either backfill via a one-off script/Cloud Function or
   accept that pre-existing invite codes stop resolving until backfilled.

6. **Manual verification**
   - Fresh sign-in → onboarding → "Create a home" completes without a
     permissions error and the household/member/user docs are all created.
   - Second user → "Join a home" with the generated code succeeds.
   - Duplicate join-code generation collision (force via lowered alphabet
     size, or temporarily hardcode) still retries correctly using the new
     `joinCodes` get-based check.

## Risks / Open Questions
- **Backfill**: any household created before this change has no
  corresponding `joinCodes` document, so its existing invite code will stop
  working for joins until backfilled (task 5). Confirm whether the app has
  real user data yet, or if this is still pre-launch (in which case backfill
  can be skipped).
- **Code-squatting**: without the optional `get()` check tying
  `joinCodes/{code}` to a household actually owned by `request.auth.uid`,
  a malicious client could theoretically write an unclaimed code pointing at
  an arbitrary `householdId` string (though it can't fabricate a real
  household doc, so this is low severity — worth a follow-up rule
  tightening, not a blocker).
- **`CreateHouseholdForm.tsx`** is currently a disabled placeholder and not
  wired to `useHousehold().createHousehold` — the real create/join UI lives
  in [OnboardingPage.tsx](web/src/app/pages/OnboardingPage.tsx) and
  [HouseholdPage.tsx](web/src/app/pages/HouseholdPage.tsx). Out of scope for
  this fix, but worth flagging as dead/incomplete code.
