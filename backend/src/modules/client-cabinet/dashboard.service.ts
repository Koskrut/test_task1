import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_ORDERS_REPOSITORY } from './client-cabinet.tokens';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { ClientOrdersRepository } from './repositories/client-orders.repository';
import { ClientContextService } from './client-context.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(
    private readonly clientContext: ClientContextService,
    @Inject(CLIENT_ORDERS_REPOSITORY)
    private readonly ordersRepo: ClientOrdersRepository,
  ) {}

  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    const client = await this.clientContext.requireClient(userId);
    const activeOrders = await this.ordersRepo.listActiveByClient(
      client.id,
      5,
    );
    const totalOrders = await this.ordersRepo.countByClient(client.id);
    const activeOrdersCount = await this.ordersRepo.countByClient(client.id, {
      status: [
        OrderStatus.pending_payment,
        OrderStatus.paid,
        OrderStatus.processing,
        OrderStatus.packed,
        OrderStatus.shipped,
      ],
    });

    return {
      activeOrders: activeOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount.toString(),
        currency: order.currency,
        createdAt: order.createdAt,
        deliveryStatus: order.deliveryStatus,
        ttn: order.ttn,
        providerStatus: order.providerStatus ?? undefined,
      })),
      stats: {
        totalOrders,
        activeOrders: activeOrdersCount,
      },
    };
  }
}
