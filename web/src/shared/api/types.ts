export interface ApiErrorResponse {
  message?: string
  error?: string
  statusCode?: number
  details?: unknown
}

export interface ApiPaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
