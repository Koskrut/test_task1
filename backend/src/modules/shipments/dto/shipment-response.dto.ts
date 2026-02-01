import { DeliveryStatus } from '../../../common/types/status';

export class ShipmentResponseDto {
  deliveryId!: string;
  orderId!: string;
  ttn!: string;
  providerRef!: string | null;
  status!: DeliveryStatus;
}
