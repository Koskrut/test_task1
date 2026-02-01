import { apiRequest } from './http'
import { AuthTokens } from '../types/auth'
import { AuthUser, UserRole } from '../../entities/user/model/types'
import { parseJwt } from '../lib/jwt'

export interface LoginResponse extends AuthTokens {
  user: AuthUser
}

export async function login(
  identifier: string,
  password: string,
): Promise<LoginResponse> {
  const tokens = await apiRequest<AuthTokens>('/auth/login', {
    method: 'POST',
    body: { identifier, password },
  })

  const payload = parseJwt(tokens.accessToken)
  const role = (payload?.role as UserRole | undefined) ?? UserRole.Manager
  const userId = (payload?.sub as string | undefined) ?? ''

  return {
    ...tokens,
    user: {
      id: userId,
      role,
    },
  }
}

export async function logout(refreshToken: string): Promise<void> {
  await apiRequest('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  })
}
