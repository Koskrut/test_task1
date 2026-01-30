import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateSessionInput,
  SessionRecord,
  SessionsRepository,
} from '../repositories/sessions.repository';

@Injectable()
export class PrismaSessionsRepository implements SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionInput): Promise<SessionRecord> {
    return this.prisma.userSession.create({
      data: {
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        deviceId: data.deviceId ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByTokenHash(
    refreshTokenHash: string,
  ): Promise<SessionRecord | null> {
    return this.prisma.userSession.findFirst({
      where: { refreshTokenHash },
    });
  }

  async rotate(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<SessionRecord> {
    return this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash,
        expiresAt,
        revokedAt: null,
      },
    });
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }
}
