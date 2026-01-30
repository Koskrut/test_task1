import { DeliveryStatus, Prisma } from '@prisma/client';

export interface DeliveryEntity {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  ttn: string | null;
  providerRef: string | null;
  shippingCost: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeliveryInput {
  orderId: string;
  provider: string;
  status: DeliveryStatus;
  shippingCost: number;
}

export interface UpdateDeliveryInput {
  status?: DeliveryStatus;
  ttn?: string | null;
  providerRef?: string | null;
}

export interface DeliveriesRepository {
  create(data: CreateDeliveryInput): Promise<DeliveryEntity>;
  findByOrderId(orderId: string): Promise<DeliveryEntity | null>;
  findByTtn(ttn: string): Promise<DeliveryEntity | null>;
  update(id: string, data: UpdateDeliveryInput): Promise<DeliveryEntity>;
}
