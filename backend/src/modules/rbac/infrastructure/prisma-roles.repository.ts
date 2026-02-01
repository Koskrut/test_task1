import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { RoleEntity } from '../rbac.types';
import { CreateRoleInput, RolesRepository } from '../repositories/roles.repository';

@Injectable()
export class PrismaRolesRepository implements RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoleInput): Promise<RoleEntity> {
    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        isSystem: data.isSystem ?? false,
      },
    });
  }

  async findAll(): Promise<RoleEntity[]> {
    return this.prisma.role.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async addPermission(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy?: string | null,
  ): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        assignedBy: assignedBy ?? null,
      },
    });
  }
}
