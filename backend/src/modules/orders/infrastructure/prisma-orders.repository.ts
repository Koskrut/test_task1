import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateOrderInput,
  CreateOrderItemInput,
  OrderEntity,
  OrdersRepository,
} from '../repositories/orders.repository';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithItems(
    order: CreateOrderInput,
    items: CreateOrderItemInput[],
  ): Promise<OrderEntity> {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: order.orderNumber,
          clientId: order.clientId,
          managerId: order.managerId ?? null,
          source: order.source,
          currency: order.currency,
          totalAmount: new Prisma.Decimal(order.totalAmount),
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: created.id,
          productId: item.productId,
          qty: item.qty,
          priceAmount: new Prisma.Decimal(item.priceAmount),
          totalAmount: new Prisma.Decimal(item.totalAmount),
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
    status: Prisma.OrderStatus,
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
