import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AUDIT_LOGS_REPOSITORY } from '../../common/constants/tokens';
import { AuditLogsRepository } from '../../common/repositories/audit-logs.repository';
import { ClientContextService } from './client-context.service';
import { CLIENT_ORDERS_REPOSITORY } from './client-cabinet.tokens';
import { ClientOrderDetailDto } from './dto/client-order-detail.dto';
import { ClientOrderSummaryDto } from './dto/client-order-summary.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { OrderListResponseDto } from './dto/order-list-response.dto';
import { ClientOrdersRepository } from './repositories/client-orders.repository';

@Injectable()
export class ClientOrdersService {
  constructor(
    private readonly clientContext: ClientContextService,
    @Inject(CLIENT_ORDERS_REPOSITORY)
    private readonly ordersRepo: ClientOrdersRepository,
    @Inject(AUDIT_LOGS_REPOSITORY)
    private readonly auditRepo: AuditLogsRepository,
  ) {}

  async listOrders(
    userId: string,
    query: OrderListQueryDto,
  ): Promise<OrderListResponseDto> {
    const client = await this.clientContext.requireClient(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.ordersRepo.listByClient(
      client.id,
      { status: query.status ?? null },
      { skip, take: limit },
    );

    return {
      items: items.map((order): ClientOrderSummaryDto => ({
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
      page,
      limit,
      total,
    };
  }

  async getOrder(
    userId: string,
    orderId: string,
  ): Promise<ClientOrderDetailDto> {
    const client = await this.clientContext.requireClient(userId);
    const order = await this.ordersRepo.findById(client.id, orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
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
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        qty: item.qty,
        priceAmount: item.priceAmount.toString(),
        totalAmount: item.totalAmount.toString(),
      })),
    };
  }

  async repeatOrder(
    userId: string,
    orderId: string,
  ): Promise<ClientOrderDetailDto> {
    const client = await this.clientContext.requireClient(userId);
    const existing = await this.ordersRepo.findById(client.id, orderId);
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const items = existing.items.map((item) => ({
      productId: item.productId,
      qty: item.qty,
      priceAmount: item.priceAmount,
    }));

    const created = await this.ordersRepo.createRepeatOrder(
      client.id,
      'client_cabinet',
      items,
    );

    await this.auditRepo.create({
      actorId: userId,
      action: 'client.order.repeat',
      entityType: 'order',
      entityId: created.id,
    });

    return {
      id: created.id,
      orderNumber: created.orderNumber,
      status: created.status,
      paymentStatus: created.paymentStatus,
      totalAmount: created.totalAmount.toString(),
      currency: created.currency,
      createdAt: created.createdAt,
      deliveryStatus: created.deliveryStatus,
      ttn: created.ttn,
      providerStatus: created.providerStatus ?? undefined,
      items: created.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        qty: item.qty,
        priceAmount: item.priceAmount.toString(),
        totalAmount: item.totalAmount.toString(),
      })),
    };
  }
}
