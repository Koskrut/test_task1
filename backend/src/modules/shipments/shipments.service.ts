import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeliveryStatus, OrderStatus } from '../../common/types/status';
import {
  DELIVERIES_REPOSITORY,
  DELIVERY_EVENTS_REPOSITORY,
  ORDERS_REPOSITORY,
  SHIPMENTS_REPOSITORY,
  WEBHOOK_EVENTS_REPOSITORY,
} from '../../common/constants/tokens';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { OrdersService } from '../orders/orders.service';
import { OrderEntity, OrdersRepository } from '../orders/repositories/orders.repository';
import { NovaPoshtaService } from '../nova-poshta/nova-poshta.service';
import { ShipOrderDto } from './dto/ship-order.dto';
import { ShipmentResponseDto } from './dto/shipment-response.dto';
import { ShipmentStatusResponseDto } from './dto/shipment-status-response.dto';
import { DeliveriesRepository } from './repositories/deliveries.repository';
import { DeliveryEventsRepository } from './repositories/delivery-events.repository';
import { ShipmentsRepository } from './repositories/shipments.repository';
import { WebhookEventsRepository } from './repositories/webhook-events.repository';

@Injectable()
export class ShipmentsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly novaPoshtaService: NovaPoshtaService,
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepo: OrdersRepository,
    @Inject(DELIVERIES_REPOSITORY)
    private readonly deliveriesRepo: DeliveriesRepository,
    @Inject(SHIPMENTS_REPOSITORY)
    private readonly shipmentsRepo: ShipmentsRepository,
    @Inject(DELIVERY_EVENTS_REPOSITORY)
    private readonly deliveryEventsRepo: DeliveryEventsRepository,
    @Inject(WEBHOOK_EVENTS_REPOSITORY)
    private readonly webhookEventsRepo: WebhookEventsRepository,
  ) {}

  async createShipment(
    user: JwtPayload,
    orderId: string,
    dto: ShipOrderDto,
  ): Promise<ShipmentResponseDto> {
    const order = await this.requireOrder(orderId, user);

    if (user.role === UserRole.Manager) {
      await this.ordersService.ensureManagerAttached(orderId, user.sub);
    }

    const existingDelivery = await this.deliveriesRepo.findByOrderId(orderId);
    if (existingDelivery?.ttn) {
      throw new BadRequestException('Shipment already exists for this order');
    }

    const delivery =
      existingDelivery ??
      (await this.deliveriesRepo.create({
        orderId,
        provider: 'nova_poshta',
        status: DeliveryStatus.pending,
        shippingCost: dto.cost,
      }));

    const ttnResult = await this.novaPoshtaService.createTtn({
      ...dto,
      orderNumber: order.orderNumber,
    });

    const updatedDelivery = await this.deliveriesRepo.update(delivery.id, {
      status: DeliveryStatus.label_created,
      ttn: ttnResult.ttn,
      providerRef: ttnResult.ref,
    });

    await this.shipmentsRepo.create({
      deliveryId: updatedDelivery.id,
      ttn: ttnResult.ttn,
      npRef: ttnResult.ref,
      status: 'label_created',
      costAmount: ttnResult.cost ?? dto.cost,
      raw: ttnResult.raw,
    });

    await this.deliveryEventsRepo.create({
      deliveryId: updatedDelivery.id,
      status: DeliveryStatus.label_created,
      rawStatus: 'label_created',
      payload: { ttn: ttnResult.ttn },
    });

    await this.ordersService.setStatusInternal(orderId, OrderStatus.processing);

    return {
      deliveryId: updatedDelivery.id,
      orderId,
      ttn: ttnResult.ttn,
      providerRef: ttnResult.ref,
      status: updatedDelivery.status,
    };
  }

  async getShipmentStatus(
    user: JwtPayload,
    ttn: string,
  ): Promise<ShipmentStatusResponseDto> {
    const shipment = await this.shipmentsRepo.findByTtn(ttn);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const delivery = await this.deliveriesRepo.findByTtn(ttn);
    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (user.role === UserRole.Manager) {
      const order = await this.ordersRepo.findById(delivery.orderId);
      if (order?.managerId && order.managerId !== user.sub) {
        throw new ForbiddenException('Access denied');
      }
    }

    const status = await this.novaPoshtaService.getStatus(ttn);
    const deliveryStatus = this.novaPoshtaService.mapDeliveryStatus(
      status.statusCode,
      status.status,
    );

    await this.shipmentsRepo.updateByTtn(ttn, {
      status: status.status ?? shipment.status,
      raw: status.raw,
    });

    await this.deliveriesRepo.update(delivery.id, {
      status: deliveryStatus,
    });

    await this.deliveryEventsRepo.create({
      deliveryId: delivery.id,
      status: deliveryStatus,
      rawStatus: status.status ?? null,
      payload: status.raw,
    });

    return {
      ttn,
      providerStatus: status.status,
      deliveryStatus,
      raw: status.raw,
      updatedAt: new Date(),
    };
  }

  async handleWebhook(payload: Record<string, unknown>): Promise<void> {
    await this.webhookEventsRepo.create({
      provider: 'nova_poshta',
      eventType: 'webhook',
      payload,
    });

    const ttn = this.extractTtn(payload);
    if (!ttn) {
      return;
    }

    const statusText = this.extractStatus(payload);
    const statusCode = this.extractStatusCode(payload);
    const deliveryStatus = this.novaPoshtaService.mapDeliveryStatus(
      statusCode,
      statusText,
    );

    const delivery = await this.deliveriesRepo.findByTtn(ttn);
    if (!delivery) {
      return;
    }

    const shipment = await this.shipmentsRepo.findByTtn(ttn);
    if (shipment) {
      await this.shipmentsRepo.updateByTtn(ttn, {
        status: statusText ?? shipment.status ?? 'unknown',
        raw: payload,
      });
    }

    await this.deliveriesRepo.update(delivery.id, {
      status: deliveryStatus,
    });

    await this.deliveryEventsRepo.create({
      deliveryId: delivery.id,
      status: deliveryStatus,
      rawStatus: statusText,
      payload,
    });
  }

  private async requireOrder(
    orderId: string,
    user: JwtPayload,
  ): Promise<OrderEntity> {
    const order = await this.ordersRepo.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role === UserRole.Manager && order.managerId && order.managerId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  private extractTtn(payload: Record<string, unknown>): string | null {
    const direct = (payload['ttn'] as string) || (payload['Number'] as string);
    if (direct) {
      return direct;
    }
    const data = payload['data'];
    if (Array.isArray(data) && data[0]) {
      return (data[0]['Number'] as string) || (data[0]['DocumentNumber'] as string) || null;
    }
    return null;
  }

  private extractStatus(payload: Record<string, unknown>): string | null {
    const direct = payload['Status'] as string;
    if (direct) {
      return direct;
    }
    const data = payload['data'];
    if (Array.isArray(data) && data[0]) {
      return (data[0]['Status'] as string) || null;
    }
    return null;
  }

  private extractStatusCode(payload: Record<string, unknown>): string | null {
    const direct = payload['StatusCode'] as string;
    if (direct) {
      return direct;
    }
    const data = payload['data'];
    if (Array.isArray(data) && data[0]) {
      return (data[0]['StatusCode'] as string) || null;
    }
    return null;
  }
}
