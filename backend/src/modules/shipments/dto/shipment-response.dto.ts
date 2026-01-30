import { DeliveryStatus } from '@prisma/client';

export class ShipmentResponseDto {
  deliveryId: string;
  orderId: string;
  ttn: string;
  providerRef: string | null;
  status: DeliveryStatus;
}
