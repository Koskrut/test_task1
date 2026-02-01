import { PaginatedResult } from '../types/pagination'

export interface ApiErrorResponse {
  message?: string
  error?: string
  statusCode?: number
  details?: unknown
}

export type ApiPaginatedResponse<T> = PaginatedResult<T>
