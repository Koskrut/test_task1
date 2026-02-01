import { apiRequest } from './http'
import { Order, PaginatedResult } from './types'

export interface OrdersQuery {
  page?: number
  limit?: number
  status?: string
}

export async function getOrders(
  query: OrdersQuery,
): Promise<PaginatedResult<Order>> {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.status) params.set('status', query.status)
  const queryString = params.toString()
  return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`)
}

export async function getOrderById(id: string): Promise<Order> {
  return apiRequest(`/orders/${id}`)
}
