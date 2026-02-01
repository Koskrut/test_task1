import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateGpsLogInput,
  GpsLogEntity,
  GpsLogsRepository,
} from '../repositories/gps-logs.repository';

@Injectable()
export class PrismaGpsLogsRepository implements GpsLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateGpsLogInput): Promise<GpsLogEntity> {
    return this.prisma.gpsLog.create({
      data: {
        userId: data.userId,
        deviceId: data.deviceId,
        lat: data.lat,
        lng: data.lng,
        accuracyM: data.accuracyM,
        speedKmh: data.speedKmh,
        isMocked: data.isMocked,
      },
    });
  }

  async findLatestByUser(userId: string): Promise<GpsLogEntity | null> {
    return this.prisma.gpsLog.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async calculateDistanceMeters(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ distance: number }[]>`
      SELECT ST_DistanceSphere(
        ST_MakePoint(${fromLng}, ${fromLat}),
        ST_MakePoint(${toLng}, ${toLat})
      ) AS distance
    `;

    return rows[0]?.distance ?? 0;
  }
}
