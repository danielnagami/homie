# Homie — Web Frontend

The mobile-first React PWA for Homie: a gamified household to-do app for families and roommates.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7
- ESLint (flat config) + Prettier

## Scripts

```sh
npm run dev       # start dev server
npm run build     # type-check + production build (dist/)
npm run lint      # ESLint
npm run format    # Prettier
npm run preview   # preview the production build
```

## Firebase

Firebase is wired up in task 2 of `../PLAN.md`. The client SDK is initialized in
`src/firebase/firebaseClient.ts` from `VITE_FIREBASE_*` env vars.

### Local setup

1. Copy `web/.env.example` to `web/.env.local` and fill in your Firebase web-app
   config. Never commit `.env.local` (git-ignored via `.env.*`).
2. Run `npm run dev`. Until the env vars are set, `isFirebaseConfigured` is `false`
   and `auth`/`db` are `null`, so screens that call `requireFirebaseConfig()` fail
   fast with a clear message instead of crashing.

### Firebase Console steps (one-time, not automatable from this repo)

1. Create a Firebase project.
2. Add a **Web app** and copy its config into `web/.env.local`.
3. Enable **Firestore** (production mode).
4. Enable **Cloud Functions** — requires the **Blaze** (pay-as-you-go) plan.
5. Enable **Authentication** providers. Per the plan the app is **SSO-only**
   (Google + Microsoft, no email/password); the Google provider is zero-config,
   the Microsoft provider needs an Azure AD app registration (see task 4).

Deploy Firestore rules/indexes and functions with the Firebase CLI from the repo
root: `firebase deploy --only firestore,functions` (config lives in `firebase.json`
and `.firebaserc` — set your project id there).
