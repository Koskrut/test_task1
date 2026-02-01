import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateDeliveryEventInput,
  DeliveryEventsRepository,
} from '../repositories/delivery-events.repository';

@Injectable()
export class PrismaDeliveryEventsRepository implements DeliveryEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDeliveryEventInput): Promise<void> {
    await this.prisma.deliveryEvent.create({
      data: {
        deliveryId: data.deliveryId,
        status: data.status,
        rawStatus: data.rawStatus ?? null,
        payload: data.payload ?? {},
      },
    });
  }
}
