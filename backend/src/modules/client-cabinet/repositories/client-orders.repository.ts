import { DeliveryStatus, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

export interface ClientOrderSummaryRecord {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: Prisma.Decimal;
  currency: string;
  createdAt: Date;
  deliveryStatus: DeliveryStatus | null;
  ttn: string | null;
  providerStatus: string | null;
}

export interface ClientOrderDetailRecord extends ClientOrderSummaryRecord {
  items: {
    id: string;
    productId: string | null;
    qty: number;
    priceAmount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
  }[];
}

export interface ClientOrdersRepository {
  listByClient(
    clientId: string,
    filter: { status?: OrderStatus | null },
    pagination: { skip: number; take: number },
  ): Promise<{ items: ClientOrderSummaryRecord[]; total: number }>;
  listActiveByClient(
    clientId: string,
    limit: number,
  ): Promise<ClientOrderSummaryRecord[]>;
  countByClient(
    clientId: string,
    filter?: { status?: OrderStatus[] },
  ): Promise<number>;
  findById(
    clientId: string,
    orderId: string,
  ): Promise<ClientOrderDetailRecord | null>;
  createRepeatOrder(
    clientId: string,
    source: string,
    items: {
      productId: string | null;
      qty: number;
      priceAmount: Prisma.Decimal;
    }[],
    managerId?: string | null,
  ): Promise<ClientOrderDetailRecord>;
}
