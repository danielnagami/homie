# Plan: Fix "Unable to process request due to missing initial state" on Google SSO

## Overview

Users attempting to sign in with Google (and potentially Microsoft) SSO see:

> Unable to process request due to missing initial state...

This is a Firebase Auth SDK error (`auth/missing-initial-state` / `auth/web-storage-unsupported`-adjacent) thrown when the SDK completes an OAuth **redirect** flow but can't find the `sessionStorage`-backed "pending redirect" record it wrote before leaving the app. It is not thrown by app code directly — it surfaces from `firebase/auth` internals during initialization or `getRedirectResult()`-equivalent processing.

Three facts from this codebase make the redirect path very likely to be involved, even though the app only calls `signInWithPopup`:

1. **The app is a fully installable PWA** ([vite.config.ts](web/vite.config.ts): `VitePWA` with `display: 'standalone'`, `registerType: 'autoUpdate'`, a Workbox service worker with `navigateFallback: '/index.html'`). Firebase Auth automatically **falls back from popup to redirect** in several situations it can't fully control from app code: popups blocked, in-app/webview browsers, and — critically — when the page is running in an installed/standalone PWA context, where browsers force OAuth to open in an external browser tab rather than a popup. When that happens, the "initial state" `sessionStorage` written in the PWA's browsing context is not reliably available when the OAuth provider redirects back, especially if the return lands in a different tab/context (common on Android/iOS home-screen installs) → exactly this error.
2. **No `getRedirectResult()` handling exists anywhere** in [useAuth.ts](web/src/features/auth/useAuth.ts). The app only calls `signInWithPopup` and listens to `onAuthStateChanged`. If the SDK silently uses the redirect fallback described above, there is no app code path that resolves or surfaces the result/error of that redirect — the SDK throws internally during its own auto-resolution on the next load, and the app has no way to catch/handle it gracefully (no retry, no user-facing recovery, no logging of which provider/step failed).
3. **A Workbox service worker intercepts navigation requests** (`navigateFallback: '/index.html'`, `globPatterns` covering `html`). Firebase's redirect/auth-handler flow relies on specific navigation requests (to `/__/auth/handler` and similar paths on the `authDomain`, and the return navigation to the app origin) completing untouched. A service worker with a catch-all `navigateFallback` and no denylist can intercept the return navigation and serve cached `index.html` instead of allowing the auth SDK's normal page-load initialization to run against a fresh network response, which is a documented contributor to redirect-state resolution failures in PWAs.

Additional lower-probability contributors to rule out:
- The app is deployed via **Azure Static Web Apps** (see `.github/workflows/azure-static-web-apps-*.yml`), not Firebase Hosting, while `authDomain` is (presumably) the default `*.firebaseapp.com`. This cross-origin popup/redirect setup is supported by Firebase but depends on third-party storage access (cookies/IndexedDB) for the auth iframe/redirect handshake — browsers with strict third-party-cookie blocking (Safari ITP, Chrome partitioning, Brave, incognito) are more prone to this class of error.
- If affected users are on iOS/Android and have "installed" the app to their home screen (very likely given it's a PWA with `display: 'standalone'`), this is close to a confirmed root cause rather than just a contributor.

## Architecture

```mermaid
flowchart TD
    Click[User clicks Sign in with Google] --> Popup{signInWithPopup}
    Popup -- popup opens fine, same tab context --> PopupOK[Popup completes, postMessage back, onAuthStateChanged fires]
    Popup -- blocked / standalone PWA / in-app browser --> AutoRedirect[SDK auto-falls back to signInWithRedirect]
    AutoRedirect --> WriteState["SDK writes 'pending redirect' state to sessionStorage"]
    WriteState --> Navigate[Full-page navigate to Google OAuth]
    Navigate --> ReturnNav[OAuth provider redirects back to app origin]
    ReturnNav --> SWIntercept{Service worker intercepts navigation?}
    SWIntercept -- yes, serves cached index.html --> Corrupted[Fresh init races cached shell; state read can fail]
    SWIntercept -- no, network passthrough --> ReadState[SDK reads back sessionStorage state]
    ReadState -- found --> Success[Auth completes, onAuthStateChanged fires]
    ReadState -- not found (new tab/context, storage partitioned, or SW interference) --> ErrorState["auth/missing-initial-state error thrown"]
    Corrupted --> ErrorState
    ErrorState --> NoHandler[No getRedirectResult()/catch in useAuth -> unhandled, confusing UX]
```

## Tech Stack

No new dependencies. Uses existing `firebase/auth` APIs (`getRedirectResult`, `signInWithRedirect`), existing `useAuth` hook, existing `vite-plugin-pwa`/Workbox config.

## File Structure (files to modify)

```
web/vite.config.ts                        (modified: exclude Firebase auth handler paths from SW navigateFallback)
web/src/features/auth/useAuth.ts          (modified: add getRedirectResult() handling on mount, surface/log redirect errors,
                                            optionally choose redirect vs popup based on standalone/display-mode detection)
web/src/app/pages/AuthPage.tsx            (modified: show a distinct "completing sign-in..." state while a redirect result
                                            is being resolved, and a clearer recovery message for this specific error)
web/.env.example / deployment docs         (verify: confirm authDomain value and cookie/storage guidance — no code change,
                                            investigation only)
```

## Task Breakdown

1. **Confirm reproduction conditions (investigation, no code change)** — determine, from the affected user(s), whether they hit this (a) on desktop Chrome/Edge/Firefox in a normal browser tab, (b) on mobile with the app installed to the home screen (standalone PWA), (c) inside an in-app/webview browser (e.g. opened from a chat app, social app, or email client), or (d) with third-party cookies/blocking enabled (Safari private mode, Brave, strict tracking protection). This determines whether the fix should focus on the PWA/redirect path (most likely) or a service-worker/config issue that also affects normal popup flow.
2. **Add `getRedirectResult()` handling to `useAuth`** — on mount (alongside the existing `onAuthStateChanged` subscription, before/independently of it), call `getRedirectResult(auth)` once and:
   - on success with a user, run the same `ensureUserProfile`/`setUser` path used by the popup flow (so a redirect-completed sign-in is handled identically to a popup-completed one).
   - on failure, catch the error and map `auth/missing-initial-state` (and related codes like `auth/web-storage-unsupported`, `auth/network-request-failed`) to a clear, actionable message (e.g. "Your browser blocked the sign-in session. Try again in your device's default browser with cookies enabled, or disable private/incognito mode.") instead of an unhandled console error.
   - expose an `isResolvingRedirect` (or similar) boolean so `AuthPage` can show a brief "Completing sign-in..." state instead of flashing the normal sign-in buttons while this resolves.
3. **Exclude Firebase Auth handler paths from the service worker** — in [vite.config.ts](web/vite.config.ts)'s `VitePWA({ workbox: { ... } })`, add a `navigateFallbackDenylist` (e.g. `[/^\/__\/auth\//, /^\/__\/firebase\//]`) so the SW never intercepts navigation requests tied to Firebase's auth handler/redirect flow, ensuring those requests always hit the network directly rather than being served from the SW's cached app shell.
4. **Decide and implement popup-vs-redirect strategy for standalone/PWA contexts** — detect `window.matchMedia('(display-mode: standalone)')` (or `navigator.standalone` for iOS) in `useAuth`/`AuthPage`, and when true, proactively call `signInWithRedirect` instead of `signInWithPopup` so the app is explicitly driving the flow it needs to handle (task 2), rather than relying on the SDK's implicit, less predictable popup→redirect fallback. Keep `signInWithPopup` as the default for normal browser tabs where it works reliably today.
5. **Verify `authDomain` / hosting configuration** — confirm `VITE_FIREBASE_AUTH_DOMAIN` (used in [firebaseClient.ts](web/src/firebase/firebaseClient.ts) and set via the Azure Static Web Apps GitHub Actions secret) is the standard `<project-id>.firebaseapp.com` value and that the corresponding OAuth redirect URIs are authorized in both the Firebase console and the Google/Microsoft OAuth app configs. Document (not code) any third-party-cookie caveats for testers on Safari/Brave.
6. **Update `AuthPage` UX for the redirect-completing state and this specific error** — while `isResolvingRedirect` is true, show a splash/loading state (reusing the existing loading pattern) instead of the sign-in buttons; when `error` matches the mapped message from task 2, render it with the more specific recovery guidance rather than the generic error banner.
7. **Regression pass** — verify: (a) normal desktop popup sign-in still works unchanged; (b) installing the PWA to a mobile home screen and signing in via the redirect path completes successfully and lands in the app (no more missing-initial-state error); (c) forcing a popup-block (e.g. via browser setting) on desktop still recovers gracefully instead of an unhandled error; (d) service worker no longer intercepts `/__/auth/*` requests (check Network tab / SW request log); (e) error messaging is clear if a tester deliberately uses a browser with third-party cookies/storage blocked.

## Risks / Open Questions

- **Cannot confirm the exact trigger without the affected user's environment.** This plan is grounded in the most likely cause given the codebase (installed PWA + no redirect-result handling + service worker with no auth-path denylist), but task 1 should be done first to avoid guessing; if the user reproduces this on a plain desktop browser tab with no PWA install, the root cause is more likely the service worker / third-party-cookie angle (tasks 3 and 5) rather than the standalone-PWA redirect angle (task 4).
- **Switching to `signInWithRedirect` for standalone contexts changes UX** (full-page navigation away and back instead of a popup) — confirm this tradeoff is acceptable versus leaving popup-only and just hardening error handling/messaging (tasks 2, 3, 6 alone, without task 4).
- **Third-party cookie/storage restrictions are partly out of the app's control** — for users in strict private-browsing modes, no code change fully eliminates the risk; the realistic goal is graceful degradation (clear message + retry path) rather than a 100% guarantee.
- **Overlap with [PLAN-require-sso-login.md](PLAN-require-sso-login.md):** that plan's `RequireAuth`/`useOnboarding` flow already exists in code ([RequireAuth.tsx](web/src/app/RequireAuth.tsx)); this plan's changes are additive to `useAuth`/`AuthPage`/`vite.config.ts` and should not conflict, but the implementer should re-check `RequireAuth`'s `Splash` component is reused consistently for the new `isResolvingRedirect` state rather than duplicating markup.

---

**Suggested next step:** hand this plan to an implementation agent starting with tasks 2 and 3 (redirect-result handling + SW denylist), which address the most likely root cause and are low-risk/backward-compatible, then task 1's findings should confirm whether task 4 (explicit redirect for standalone mode) is actually needed.
