export interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: string
  currency: string
  createdAt: string
  clientId: string
  managerId?: string | null
  items?: OrderItem[]
  delivery?: {
    status?: string | null
    ttn?: string | null
  }
}

export interface OrderItem {
  id: string
  productId: string | null
  qty: number
  priceAmount: string
  totalAmount: string
}

export interface ShipmentStatus {
  ttn: string
  providerStatus: string | null
  deliveryStatus: string
  raw: Record<string, unknown>
  updatedAt: string
}
