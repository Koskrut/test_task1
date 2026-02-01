import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'
import { env } from '../lib/env'
import { useAuthStore } from '../../features/auth/model/authStore'
import type { AuthTokens } from '../types/auth'
import type { ApiErrorResponse } from './types'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

export class ApiClientError extends Error {
  status?: number
  data?: ApiErrorResponse | unknown

  constructor(message: string, status?: number, data?: ApiErrorResponse | unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
})

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
})

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function enqueueRefresh(callback: (token: string | null) => void) {
  refreshQueue.push(callback)
}

function resolveRefreshQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token))
  refreshQueue = []
}

async function refreshTokens(): Promise<AuthTokens | null> {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) {
    return null
  }

  const response = await refreshClient.post<AuthTokens>('/auth/refresh', {
    refreshToken,
  })
  return response.data
}

function isAuthEndpoint(url?: string) {
  return url?.includes('/auth/login') || url?.includes('/auth/refresh')
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          enqueueRefresh((token) => {
            if (!token) {
              reject(error)
              return
            }
            originalRequest.headers = originalRequest.headers ?? {}
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true
      try {
        const tokens = await refreshTokens()
        if (!tokens) {
          useAuthStore.getState().logout()
          resolveRefreshQueue(null)
          throw error
        }
        useAuthStore.getState().setTokens(tokens)
        resolveRefreshQueue(tokens.accessToken)
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        resolveRefreshQueue(null)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(normalizeError(error))
  },
)

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config)
  return response.data
}

function normalizeError(error: AxiosError<ApiErrorResponse>) {
  if (error.response) {
    return new ApiClientError(
      'API request failed',
      error.response.status,
      error.response.data,
    )
  }
  return new ApiClientError('Network error')
}
