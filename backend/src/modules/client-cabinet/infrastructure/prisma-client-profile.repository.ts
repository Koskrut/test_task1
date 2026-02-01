import { Injectable } from '@nestjs/common';
import { Address } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ClientProfileRepository } from '../repositories/client-profile.repository';

@Injectable()
export class PrismaClientProfileRepository implements ClientProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listAddresses(clientId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { crmClientId: clientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
