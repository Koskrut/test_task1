import { useMutation } from '@tanstack/react-query'
import { login } from '../api'
import { useAuthStore } from './authStore'

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const setStatus = useAuthStore((state) => state.setStatus)

  return useMutation({
    mutationFn: (payload: { identifier: string; password: string }) =>
      login(payload.identifier, payload.password),
    onMutate: () => setStatus('checking'),
    onSuccess: (data) => {
      setAuth(data, data.user)
    },
    onError: () => setStatus('unauthenticated'),
  })
}
