import { DeliveryStatus, OrderStatus, PaymentStatus } from '../../../common/types/status';

export class ClientOrderItemDto {
  id!: string;
  productId!: string | null;
  qty!: number;
  priceAmount!: string;
  totalAmount!: string;
}

export class ClientOrderDetailDto {
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
  items!: ClientOrderItemDto[];
}
