import { DeliveryStatus } from '@prisma/client';

export class ShipmentStatusResponseDto {
  ttn: string;
  providerStatus: string | null;
  deliveryStatus: DeliveryStatus;
  raw: Record<string, unknown>;
  updatedAt: Date;
}
