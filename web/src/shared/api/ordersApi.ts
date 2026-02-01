import { apiRequest } from './apiClient'
import type { ApiPaginatedResponse } from './types'
import type { Order } from '../../entities/order/model/types'

export interface OrdersQuery {
  page?: number
  limit?: number
  status?: string
}

export async function getOrders(
  query: OrdersQuery,
): Promise<ApiPaginatedResponse<Order>> {
  return apiRequest({
    url: '/orders',
    method: 'GET',
    params: query,
  })
}

export async function getOrderById(id: string): Promise<Order> {
  return apiRequest({
    url: `/orders/${id}`,
    method: 'GET',
  })
}
