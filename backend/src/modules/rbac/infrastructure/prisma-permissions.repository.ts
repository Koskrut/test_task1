import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PermissionEntity } from '../rbac.types';
import {
  CreatePermissionInput,
  PermissionsRepository,
} from '../repositories/permissions.repository';

@Injectable()
export class PrismaPermissionsRepository implements PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionInput): Promise<PermissionEntity> {
    return this.prisma.permission.create({
      data: {
        code: data.code,
        description: data.description ?? null,
        module: data.module ?? null,
      },
    });
  }

  async findAll(): Promise<PermissionEntity[]> {
    return this.prisma.permission.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async assignPermissionToUser(
    userId: string,
    permissionId: string,
    grantedBy?: string | null,
  ): Promise<void> {
    await this.prisma.userPermission.create({
      data: {
        userId,
        permissionId,
        grantedBy: grantedBy ?? null,
      },
    });
  }
}
