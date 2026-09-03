import { Button } from '../../components/Button'

export function AuthPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <h1 className="font-display text-brand-600 text-5xl font-extrabold">Homie</h1>
        <p className="mt-2 text-sm text-slate-500">
          A gamified to-do app for families and roommates.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Button disabled>Sign in with Google</Button>
        <Button variant="secondary" disabled>
          Sign in with Microsoft
        </Button>
      </div>
      <p className="text-center text-xs text-slate-400">
        SSO sign-in with Google and Microsoft arrives in task 4. Firebase config is task 2.
      </p>
    </main>
  )
}
