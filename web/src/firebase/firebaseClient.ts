import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} satisfies FirebaseOptions

const reCaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined

const requiredConfigValues = Object.values(firebaseConfig)

export const isFirebaseConfigured = requiredConfigValues.every(Boolean)

export function requireFirebaseConfig(): void {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Copy web/.env.example to web/.env.local and fill in the values (task 2).',
    )
  }
}

export function getFirebaseApp(): FirebaseApp {
  requireFirebaseConfig()

  const app = getApps()[0] ?? initializeApp(firebaseConfig)

  if (reCaptchaSiteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(reCaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  }

  return app
}

export const firebaseApp = isFirebaseConfigured ? getFirebaseApp() : null
export const auth = firebaseApp ? getAuth(firebaseApp) : null
export const db = firebaseApp ? getFirestore(firebaseApp) : null
