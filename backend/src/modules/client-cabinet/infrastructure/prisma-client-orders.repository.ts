import { Injectable } from '@nestjs/common';
import { DeliveryStatus, OrderStatus, PaymentStatus } from '../../../common/types/status';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  ClientOrderDetailRecord,
  ClientOrderSummaryRecord,
  ClientOrdersRepository,
} from '../repositories/client-orders.repository';

@Injectable()
export class PrismaClientOrdersRepository implements ClientOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByClient(
    clientId: string,
    filter: { status?: OrderStatus | null },
    pagination: { skip: number; take: number },
  ): Promise<{ items: ClientOrderSummaryRecord[]; total: number }> {
    const where = {
      clientId,
      ...(filter.status ? { status: filter.status } : {}),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          delivery: {
            include: {
              shipments: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders.map((order) => this.toSummary(order)),
      total,
    };
  }

  async listActiveByClient(
    clientId: string,
    limit: number,
  ): Promise<ClientOrderSummaryRecord[]> {
    const activeStatuses: OrderStatus[] = [
      OrderStatus.pending_payment,
      OrderStatus.paid,
      OrderStatus.processing,
      OrderStatus.packed,
      OrderStatus.shipped,
    ];

    const orders = await this.prisma.order.findMany({
      where: {
        clientId,
        status: { in: activeStatuses },
      },
      include: {
        delivery: {
          include: {
            shipments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return orders.map((order) => this.toSummary(order));
  }

  async countByClient(
    clientId: string,
    filter?: { status?: OrderStatus[] },
  ): Promise<number> {
    return this.prisma.order.count({
      where: {
        clientId,
        ...(filter?.status ? { status: { in: filter.status } } : {}),
      },
    });
  }

  async findById(
    clientId: string,
    orderId: string,
  ): Promise<ClientOrderDetailRecord | null> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, clientId },
      include: {
        items: true,
        delivery: {
          include: {
            shipments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return {
      ...this.toSummary(order),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        qty: item.qty,
        priceAmount: item.priceAmount,
        totalAmount: item.totalAmount,
      })),
    };
  }

  async createRepeatOrder(
    clientId: string,
    source: string,
    items: {
      productId: string | null;
      qty: number;
      priceAmount: number;
    }[],
    managerId?: string | null,
  ): Promise<ClientOrderDetailRecord> {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.priceAmount * item.qty,
      0,
    );

    const created = await this.prisma.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          clientId,
          managerId: managerId ?? null,
          source,
          totalAmount,
          currency: 'UAH',
          status: OrderStatus.pending_payment,
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          qty: item.qty,
          priceAmount: item.priceAmount,
          totalAmount: item.priceAmount * item.qty,
        })),
      });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { items: true },
      });
    });

    return {
      id: created.id,
      orderNumber: created.orderNumber,
      status: created.status,
      paymentStatus: created.paymentStatus,
      totalAmount: created.totalAmount,
      currency: created.currency,
      createdAt: created.createdAt,
      deliveryStatus: null,
      ttn: null,
      providerStatus: null,
      items: created.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        qty: item.qty,
        priceAmount: item.priceAmount,
        totalAmount: item.totalAmount,
      })),
    };
  }

  private toSummary(order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    currency: string;
    createdAt: Date;
    delivery: { status: DeliveryStatus; ttn: string | null; shipments: { status: string | null }[] } | null;
  }): ClientOrderSummaryRecord {
    const shipmentStatus = order.delivery?.shipments?.[0]?.status ?? null;
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      currency: order.currency,
      createdAt: order.createdAt,
      deliveryStatus: order.delivery?.status ?? null,
      ttn: order.delivery?.ttn ?? null,
      providerStatus: shipmentStatus,
    };
  }

  private generateOrderNumber(): string {
    const now = Date.now().toString();
    const rand = Math.floor(Math.random() * 900 + 100);
    return `ORD-${now}-${rand}`;
  }
}
