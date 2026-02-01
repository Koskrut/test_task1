import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  ClientPreferencesRecord,
  ClientPreferencesRepository,
} from '../repositories/client-preferences.repository';

@Injectable()
export class PrismaClientPreferencesRepository
  implements ClientPreferencesRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async getByClientId(
    clientId: string,
  ): Promise<ClientPreferencesRecord | null> {
    return this.prisma.clientNotificationPreference.findUnique({
      where: { clientId },
      select: {
        clientId: true,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
      },
    });
  }

  async upsert(
    clientId: string,
    data: Partial<ClientPreferencesRecord>,
  ): Promise<ClientPreferencesRecord> {
    const updated = await this.prisma.clientNotificationPreference.upsert({
      where: { clientId },
      create: {
        clientId,
        emailEnabled: data.emailEnabled ?? true,
        smsEnabled: data.smsEnabled ?? false,
        pushEnabled: data.pushEnabled ?? true,
        inAppEnabled: data.inAppEnabled ?? true,
      },
      update: {
        emailEnabled: data.emailEnabled ?? undefined,
        smsEnabled: data.smsEnabled ?? undefined,
        pushEnabled: data.pushEnabled ?? undefined,
        inAppEnabled: data.inAppEnabled ?? undefined,
        updatedAt: new Date(),
      },
      select: {
        clientId: true,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
      },
    });

    return updated;
  }
}
