import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderResponseDto {
  id: string;
  orderNumber: string;
  clientId: string;
  managerId: string | null;
  source: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemResponseDto[];
}
