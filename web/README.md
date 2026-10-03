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
   For the production PWA hosted at `https://homie-ca99a.web.app`, set
   `VITE_FIREBASE_AUTH_DOMAIN=homie-ca99a.web.app`, rather than the default
   `homie-ca99a.firebaseapp.com`. Firebase Auth's redirect/popup helper must
   share the app's origin for Safari and installed iOS PWAs.
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
6. In **Authentication → Settings → Authorized domains**, authorize
   `homie-ca99a.web.app`. In the Microsoft app registration, add
   `https://homie-ca99a.web.app/__/auth/handler` as a redirect URI. Ensure the
   production build is compiled with the matching `VITE_FIREBASE_AUTH_DOMAIN`.

### iOS installed-app sign-in

The app always uses Firebase's popup flow for Google and Microsoft sign-in.
Do not switch installed iOS PWAs to `signInWithRedirect`: iOS returns that flow
in Safari instead of the home-screen app, which loses the PWA's sign-in state.
If iOS blocks the sign-in window, the app tells the user to allow pop-ups and
retry instead of falling back to redirect.

Deploy Firestore rules/indexes and functions with the Firebase CLI from the repo
root: `firebase deploy --only firestore,functions` (config lives in `firebase.json`
and `.firebaserc` — set your project id there).

### App Check (task 14)

Firestore security rules restrict reads/writes to household members and reserve
`totals`/`streak`/`level`/`unlockedAchievements` for the Cloud Function. App Check
is wired in `src/firebase/firebaseClient.ts` and activates automatically when
`VITE_RECAPTCHA_SITE_KEY` is set. To enable it in production:

1. In Firebase Console, enable **App Check** → **ReCAPTCHA Enterprise** for your
   web app (requires the Blaze plan and a reCAPTCHA Enterprise site key).
2. Add the site key as `VITE_RECAPTCHA_SITE_KEY` in `web/.env.local`.
3. Set `enforceAppCheck: true` in the Firestore and Cloud Functions App Check
   settings once all your clients pass.
