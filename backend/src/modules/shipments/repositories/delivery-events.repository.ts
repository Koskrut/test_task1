import { DeliveryStatus } from '@prisma/client';

export interface CreateDeliveryEventInput {
  deliveryId: string;
  status: DeliveryStatus;
  rawStatus?: string | null;
  payload?: Record<string, unknown>;
}

export interface DeliveryEventsRepository {
  create(data: CreateDeliveryEventInput): Promise<void>;
}
