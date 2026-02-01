import { apiRequest } from './apiClient'
import { ShipmentStatus } from '../../entities/order/model/types'

export async function getShipmentStatus(ttn: string): Promise<ShipmentStatus> {
  return apiRequest({
    url: `/shipments/${ttn}`,
    method: 'GET',
  })
}
