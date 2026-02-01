import type { ReactNode } from 'react'
import { useAuthSession } from '../../features/auth/model/useAuthSession'

export function AuthProvider({ children }: { children: ReactNode }) {
  useAuthSession()
  return <>{children}</>
}
