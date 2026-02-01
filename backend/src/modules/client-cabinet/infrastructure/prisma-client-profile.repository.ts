import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  ClientAddress,
  ClientProfileRepository,
} from '../repositories/client-profile.repository';

@Injectable()
export class PrismaClientProfileRepository implements ClientProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listAddresses(clientId: string): Promise<ClientAddress[]> {
    return this.prisma.address.findMany({
      where: { crmClientId: clientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
