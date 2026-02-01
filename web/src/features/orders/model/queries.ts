import { useQuery } from '@tanstack/react-query'
import { getOrderById, getOrders, getShipmentStatus, OrdersQuery } from '../api'

export function useOrders(query: OrdersQuery) {
  return useQuery({
    queryKey: ['orders', query],
    queryFn: () => getOrders(query),
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useShipmentStatus(ttn: string | undefined) {
  return useQuery({
    queryKey: ['shipment', ttn],
    queryFn: () => getShipmentStatus(ttn ?? ''),
    enabled: Boolean(ttn),
  })
}
