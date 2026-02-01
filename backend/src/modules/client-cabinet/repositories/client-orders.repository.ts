import { DeliveryStatus, OrderStatus, PaymentStatus } from '../../../common/types/status';

export interface ClientOrderSummaryRecord {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
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
    priceAmount: number;
    totalAmount: number;
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
      priceAmount: number;
    }[],
    managerId?: string | null,
  ): Promise<ClientOrderDetailRecord>;
}
