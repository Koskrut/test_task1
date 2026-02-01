import { AuthLayout } from '../../app/layouts/AuthLayout'
import { LoginView } from '../../features/auth/ui/LoginView'

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginView />
    </AuthLayout>
  )
}
