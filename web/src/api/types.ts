export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface Client {
  id: string
  name: string
  companyName?: string | null
  email?: string | null
  phone?: string | null
  status?: string | null
  assignedManagerId?: string | null
}

export interface Deal {
  id: string
  title: string
  clientId: string
  stageId: string
  valueAmount?: string | null
}

export interface PipelineStage {
  id: string
  name: string
  position: number
  color?: string | null
}

export interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
}

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
