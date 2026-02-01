import { apiRequest } from './apiClient'
import type { AuthTokens } from '../types/auth'
import type { AuthUser } from '../../entities/user/model/types'
import { UserRole } from '../../entities/user/model/types'
import { parseJwt } from '../lib/jwt'

export interface LoginResponse extends AuthTokens {
  user: AuthUser
}

export async function login(
  identifier: string,
  password: string,
): Promise<LoginResponse> {
  const tokens = await apiRequest<AuthTokens>({
    url: '/auth/login',
    method: 'POST',
    data: { identifier, password },
  })

  const user = decodeUser(tokens.accessToken)
  return {
    ...tokens,
    user,
  }
}

export async function logout(refreshToken: string): Promise<void> {
  await apiRequest({
    url: '/auth/logout',
    method: 'POST',
    data: { refreshToken },
  })
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  return apiRequest<AuthTokens>({
    url: '/auth/refresh',
    method: 'POST',
    data: { refreshToken },
  })
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>({
    url: '/users/me',
    method: 'GET',
  })
}

function decodeUser(accessToken: string): AuthUser {
  const payload = parseJwt(accessToken)
  const role = (payload?.role as UserRole | undefined) ?? UserRole.Manager
  const userId = (payload?.sub as string | undefined) ?? ''
  return { id: userId, role }
}
