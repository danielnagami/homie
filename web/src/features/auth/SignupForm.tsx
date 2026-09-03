import type { LoginFormProps } from './LoginForm'
import { LoginForm } from './LoginForm'

export function SignupForm(props: LoginFormProps) {
  return <LoginForm {...props} />
}
