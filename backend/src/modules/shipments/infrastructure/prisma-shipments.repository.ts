import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateShipmentInput,
  ShipmentEntity,
  ShipmentsRepository,
} from '../repositories/shipments.repository';

@Injectable()
export class PrismaShipmentsRepository implements ShipmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateShipmentInput): Promise<ShipmentEntity> {
    return this.prisma.novaPoshtaShipment.create({
      data: {
        deliveryId: data.deliveryId,
        ttn: data.ttn,
        npRef: data.npRef,
        status: data.status,
        costAmount:
          data.costAmount !== undefined && data.costAmount !== null
            ? data.costAmount
            : undefined,
        raw: data.raw,
      },
    });
  }

  async findByTtn(ttn: string): Promise<ShipmentEntity | null> {
    return this.prisma.novaPoshtaShipment.findFirst({
      where: { ttn },
    });
  }

  async updateByTtn(
    ttn: string,
    data: { status?: string | null; raw?: Record<string, unknown> },
  ): Promise<ShipmentEntity> {
    const existing = await this.prisma.novaPoshtaShipment.findFirst({
      where: { ttn },
    });
    if (!existing) {
      throw new Error('Shipment not found');
    }

    return this.prisma.novaPoshtaShipment.update({
      where: { id: existing.id },
      data: {
        status: data.status,
        raw: data.raw,
      },
    });
  }
}
