import { apiRequest } from './apiClient'
type ShipmentStatus = import('../../entities/order/model/types').ShipmentStatus

export async function getShipmentStatus(ttn: string): Promise<ShipmentStatus> {
  return apiRequest({
    url: `/shipments/${ttn}`,
    method: 'GET',
  })
}
