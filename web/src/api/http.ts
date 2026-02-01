import { env } from '../config/env'
import { useAuthStore } from '../store/authStore'
import { AuthTokens } from '../types/auth'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

let refreshPromise: Promise<AuthTokens | null> | null = null

async function refreshTokens(): Promise<AuthTokens | null> {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) {
    return null
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${env.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          return null
        }
        return (await res.json()) as AuthTokens
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: HttpMethod
    body?: unknown
    headers?: Record<string, string>
  } = {},
): Promise<T> {
  const { accessToken } = useAuthStore.getState()
  const url = path.startsWith('http') ? path : `${env.apiBaseUrl}${path}`

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      useAuthStore.getState().setTokens(refreshed)
      return apiRequest<T>(path, options)
    }
    useAuthStore.getState().logout()
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => undefined)
    throw new ApiError('API request failed', response.status, errorData)
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}
