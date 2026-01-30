import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  DeviceSessionRecord,
  DeviceSessionsRepository,
} from '../repositories/device-sessions.repository';

@Injectable()
export class PrismaDeviceSessionsRepository implements DeviceSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTrustedSession(
    userId: string,
    deviceId: string,
  ): Promise<DeviceSessionRecord | null> {
    return this.prisma.deviceSession.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
    });
  }
}
