import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateDeliveryInput,
  DeliveriesRepository,
  DeliveryEntity,
  UpdateDeliveryInput,
} from '../repositories/deliveries.repository';

@Injectable()
export class PrismaDeliveriesRepository implements DeliveriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDeliveryInput): Promise<DeliveryEntity> {
    return this.prisma.delivery.create({
      data: {
        orderId: data.orderId,
        provider: data.provider,
        status: data.status,
        shippingCost: data.shippingCost,
      },
    });
  }

  async findByOrderId(orderId: string): Promise<DeliveryEntity | null> {
    return this.prisma.delivery.findUnique({
      where: { orderId },
    });
  }

  async findByTtn(ttn: string): Promise<DeliveryEntity | null> {
    return this.prisma.delivery.findFirst({
      where: { ttn },
    });
  }

  async update(id: string, data: UpdateDeliveryInput): Promise<DeliveryEntity> {
    return this.prisma.delivery.update({
      where: { id },
      data: {
        status: data.status,
        ttn: data.ttn,
        providerRef: data.providerRef,
      },
    });
  }
}
