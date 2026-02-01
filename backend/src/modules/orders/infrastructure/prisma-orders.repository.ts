import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateOrderInput,
  CreateOrderItemInput,
  OrderEntity,
  OrdersRepository,
} from '../repositories/orders.repository';
import { OrderStatus } from '../../../common/types/status';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithItems(
    order: CreateOrderInput,
    items: CreateOrderItemInput[],
  ): Promise<OrderEntity> {
    return this.prisma.$transaction(async (tx: any) => {
      const created = await tx.order.create({
        data: {
          orderNumber: order.orderNumber,
          clientId: order.clientId,
          managerId: order.managerId ?? null,
          source: order.source,
          currency: order.currency,
          totalAmount: order.totalAmount,
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: created.id,
          productId: item.productId,
          qty: item.qty,
          priceAmount: item.priceAmount,
          totalAmount: item.totalAmount,
        })),
      });

      return tx.order.findUniqueOrThrow({
        where: { id: created.id },
        include: { items: true },
      });
    });
  }

  async findById(id: string): Promise<OrderEntity | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<OrderEntity> {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }

  async attachManager(id: string, managerId: string): Promise<OrderEntity> {
    return this.prisma.order.update({
      where: { id },
      data: { managerId },
      include: { items: true },
    });
  }
}
