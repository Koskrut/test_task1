import { DeliveryStatus, OrderStatus, PaymentStatus } from '../../../common/types/status';

export class ClientOrderSummaryDto {
  id!: string;
  orderNumber!: string;
  status!: OrderStatus;
  paymentStatus!: PaymentStatus;
  totalAmount!: string;
  currency!: string;
  createdAt!: Date;
  deliveryStatus!: DeliveryStatus | null;
  ttn!: string | null;
  providerStatus?: string | null;
}
