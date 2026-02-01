import { apiRequest } from './http'
import { Client, PaginatedResult } from './types'

export interface ClientsQuery {
  page?: number
  limit?: number
  search?: string
}

export async function getClients(
  query: ClientsQuery,
): Promise<PaginatedResult<Client>> {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.search) params.set('search', query.search)

  return apiRequest(`/crm/clients?${params.toString()}`)
}

export async function getClientById(id: string): Promise<Client> {
  return apiRequest(`/crm/clients/${id}`)
}
