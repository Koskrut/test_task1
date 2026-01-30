import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { ORDERS_REPOSITORY } from '../../common/constants/tokens';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersRepository } from './repositories/orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepo: OrdersRepository,
  ) {}

  async create(
    user: JwtPayload,
    dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order items are required');
    }

    const managerId =
      dto.managerId ??
      (user.role === UserRole.Manager ? user.sub : null);

    const orderNumber = this.generateOrderNumber();
    const currency = dto.currency ?? 'UAH';
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.qty * item.priceAmount,
      0,
    );

    const order = await this.ordersRepo.createWithItems(
      {
        orderNumber,
        clientId: dto.clientId,
        managerId,
        source: dto.source ?? 'crm',
        currency,
        totalAmount,
      },
      dto.items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        priceAmount: item.priceAmount,
        totalAmount: item.qty * item.priceAmount,
      })),
    );

    return this.toResponse(order);
  }

  async getById(user: JwtPayload, id: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepo.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role === UserRole.Manager && order.managerId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }

    return this.toResponse(order);
  }

  async updateStatus(
    user: JwtPayload,
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersRepo.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role === UserRole.Manager && order.managerId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.ordersRepo.updateStatus(id, dto.status);
    return this.toResponse(updated);
  }

  async ensureManagerAttached(orderId: string, managerId: string): Promise<void> {
    const order = await this.ordersRepo.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.managerId && order.managerId !== managerId) {
      throw new ForbiddenException('Order is assigned to another manager');
    }

    if (!order.managerId) {
      await this.ordersRepo.attachManager(orderId, managerId);
    }
  }

  async setStatusInternal(
    orderId: string,
    status: OrderStatus,
  ): Promise<void> {
    await this.ordersRepo.updateStatus(orderId, status);
  }

  private generateOrderNumber(): string {
    const now = Date.now().toString();
    const rand = Math.floor(Math.random() * 900 + 100);
    return `ORD-${now}-${rand}`;
  }

  private toResponse(order: {
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
    items: {
      id: string;
      productId: string | null;
      qty: number;
      priceAmount: string;
      totalAmount: string;
    }[];
  }): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      clientId: order.clientId,
      managerId: order.managerId,
      source: order.source,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount.toString(),
      currency: order.currency,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item): OrderItemResponseDto => ({
        id: item.id,
        productId: item.productId,
        qty: item.qty,
        priceAmount: item.priceAmount.toString(),
        totalAmount: item.totalAmount.toString(),
      })),
    };
  }
}
