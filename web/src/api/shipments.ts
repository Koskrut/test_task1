import { apiRequest } from './http'
import { ShipmentStatus } from './types'

export async function getShipmentStatus(ttn: string): Promise<ShipmentStatus> {
  return apiRequest(`/shipments/${ttn}`)
}
