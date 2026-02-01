import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types/auth'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.accessToken)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[]
  children: JSX.Element
}) {
  const role = useAuthStore((state) => state.user?.role)
  const token = useAuthStore((state) => state.accessToken)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  if (!role || !roles.includes(role)) {
    return <Navigate to="/not-authorized" replace />
  }
  return children
}
