import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  ClientIdentity,
  ClientIdentityRepository,
} from '../repositories/client-identity.repository';

@Injectable()
export class PrismaClientIdentityRepository implements ClientIdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<ClientIdentity | null> {
    return this.prisma.crmClient.findFirst({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
      },
    });
  }
}
