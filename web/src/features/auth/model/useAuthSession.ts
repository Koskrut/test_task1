import { useEffect } from 'react'
import { getCurrentUser } from '../api'
import { useAuthStore } from './authStore'

export function useAuthSession() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const status = useAuthStore((state) => state.status)
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser)
  const setStatus = useAuthStore((state) => state.setStatus)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    if (status !== 'idle') {
      return
    }

    if (!accessToken) {
      setStatus('unauthenticated')
      return
    }

    let isMounted = true
    setStatus('checking')

    getCurrentUser()
      .then((user) => {
        if (isMounted) {
          setCurrentUser(user)
        }
      })
      .catch(() => {
        if (isMounted) {
          clearAuth()
        }
      })

    return () => {
      isMounted = false
    }
  }, [accessToken, status, setCurrentUser, setStatus, clearAuth])
}
