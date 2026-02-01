import { useQuery } from '@tanstack/react-query'
import { getClients, getClientById } from '../api'
import type { ClientsQuery } from '../api'

export function useClients(query: ClientsQuery) {
  return useQuery({
    queryKey: ['clients', query],
    queryFn: () => getClients(query),
  })
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id ?? ''),
    enabled: Boolean(id),
  })
}
