import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

export interface OrderItemEntity {
  id: string;
  productId: string | null;
  qty: number;
  priceAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}

export interface OrderEntity {
  id: string;
  orderNumber: string;
  clientId: string;
  managerId: string | null;
  source: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: Prisma.Decimal;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemEntity[];
}

export interface CreateOrderItemInput {
  productId: string | null;
  qty: number;
  priceAmount: number;
  totalAmount: number;
}

export interface CreateOrderInput {
  orderNumber: string;
  clientId: string;
  managerId?: string | null;
  source: string;
  currency: string;
  totalAmount: number;
}

export interface OrdersRepository {
  createWithItems(
    order: CreateOrderInput,
    items: CreateOrderItemInput[],
  ): Promise<OrderEntity>;
  findById(id: string): Promise<OrderEntity | null>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderEntity>;
  attachManager(id: string, managerId: string): Promise<OrderEntity>;
}
