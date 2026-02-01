import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthTokens } from '../../../shared/types/auth'
import { AuthUser } from '../../../entities/user/model/types'

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  currentUser: AuthUser | null
  status: AuthStatus
  setAuth: (tokens: AuthTokens, user: AuthUser) => void
  setTokens: (tokens: AuthTokens) => void
  setCurrentUser: (user: AuthUser | null) => void
  setStatus: (status: AuthStatus) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      status: 'idle',
      setAuth: (tokens, user) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          currentUser: user,
          status: 'authenticated',
        }),
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      setCurrentUser: (user) =>
        set({
          currentUser: user,
          status: user ? 'authenticated' : 'unauthenticated',
        }),
      setStatus: (status) => set({ status }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          currentUser: null,
          status: 'unauthenticated',
        }),
    }),
    {
      name: 'crm-auth',
    },
  ),
)
