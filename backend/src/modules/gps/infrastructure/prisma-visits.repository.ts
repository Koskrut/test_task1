import { Injectable } from '@nestjs/common';
import { VisitStatus } from '../../../common/types/status';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateVisitInput,
  FinishVisitInput,
  VisitEntity,
  VisitsRepository,
} from '../repositories/visits.repository';

@Injectable()
export class PrismaVisitsRepository implements VisitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVisitInput): Promise<VisitEntity> {
    return this.prisma.visit.create({
      data: {
        managerId: data.managerId,
        clientId: data.clientId,
        startedAt: data.startedAt,
        status: data.status,
      },
    });
  }

  async findActiveForManagerClient(
    managerId: string,
    clientId: string,
  ): Promise<VisitEntity | null> {
    return this.prisma.visit.findFirst({
      where: {
        managerId,
        clientId,
        status: VisitStatus.started,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<VisitEntity | null> {
    return this.prisma.visit.findUnique({
      where: { id },
    });
  }

  async listByManager(managerId: string): Promise<VisitEntity[]> {
    return this.prisma.visit.findMany({
      where: { managerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async finish(id: string, data: FinishVisitInput): Promise<VisitEntity> {
    return this.prisma.visit.update({
      where: { id },
      data: {
        endedAt: data.endedAt,
        status: data.status,
      },
    });
  }
}
