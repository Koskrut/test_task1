import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/model/authStore'
import type { UserRole } from '../../entities/user/model/types'
import { Spinner } from '../../shared/ui/Spinner'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-slate-500">
      <Spinner /> Loading session...
    </div>
  )
}

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const status = useAuthStore((state) => state.status)
  const token = useAuthStore((state) => state.accessToken)

  if (status === 'idle' || status === 'checking') {
    return <LoadingScreen />
  }

  if (!token || status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  return children
}

export function RoleGuard({
  roles,
  children,
}: {
  roles: UserRole[]
  children: JSX.Element
}) {
  const status = useAuthStore((state) => state.status)
  const role = useAuthStore((state) => state.currentUser?.role)
  const token = useAuthStore((state) => state.accessToken)

  if (status === 'idle' || status === 'checking') {
    return <LoadingScreen />
  }

  if (!token || status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  if (!role || !roles.includes(role)) {
    return <Navigate to="/not-authorized" replace />
  }

  return children
}
