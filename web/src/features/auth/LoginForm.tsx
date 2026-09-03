import { Button } from '../../components/Button'

export interface LoginFormProps {
  onGoogleLogin?: () => void
  onMicrosoftLogin?: () => void
}

export function LoginForm({ onGoogleLogin, onMicrosoftLogin }: LoginFormProps) {
  return (
    <form className="flex w-full flex-col gap-3">
      <Button onClick={onGoogleLogin}>Sign in with Google</Button>
      <Button variant="secondary" onClick={onMicrosoftLogin}>
        Sign in with Microsoft
      </Button>
    </form>
  )
}
