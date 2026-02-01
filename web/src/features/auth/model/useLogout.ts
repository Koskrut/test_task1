import { useCallback } from 'react'
import { logout } from '../api'
import { useAuthStore } from './authStore'

export function useLogout() {
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return useCallback(async () => {
    if (refreshToken) {
      try {
        await logout(refreshToken)
      } catch {
        // ignore logout errors
      }
    }
    clearAuth()
  }, [refreshToken, clearAuth])
}
