import { apiRequest } from './apiClient'
import type { ApiPaginatedResponse } from './types'

type Client = import('../../entities/client/model/types').Client

export interface ClientsQuery {
  page?: number
  limit?: number
  search?: string
}

export async function getClients(
  query: ClientsQuery,
): Promise<ApiPaginatedResponse<Client>> {
  return apiRequest({
    url: '/crm/clients',
    method: 'GET',
    params: query,
  })
}

export async function getClientById(id: string): Promise<Client> {
  return apiRequest({
    url: `/crm/clients/${id}`,
    method: 'GET',
  })
}
