import { DeliveryStatus } from '../../../common/types/status';

export interface CreateDeliveryEventInput {
  deliveryId: string;
  status: DeliveryStatus;
  rawStatus?: string | null;
  payload?: Record<string, unknown>;
}

export interface DeliveryEventsRepository {
  create(data: CreateDeliveryEventInput): Promise<void>;
}
