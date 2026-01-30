import { Inject, Injectable } from '@nestjs/common';
import { ROLES_REPOSITORY } from '../../common/constants/tokens';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesRepository } from './repositories/roles.repository';
import { RoleEntity } from './rbac.types';

@Injectable()
export class RolesService {
  constructor(
    @Inject(ROLES_REPOSITORY) private readonly rolesRepo: RolesRepository,
  ) {}

  create(dto: CreateRoleDto): Promise<RoleEntity> {
    return this.rolesRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      isSystem: dto.isSystem ?? false,
    });
  }

  list(): Promise<RoleEntity[]> {
    return this.rolesRepo.findAll();
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await this.rolesRepo.addPermission(roleId, permissionId);
  }

  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy?: string,
  ): Promise<void> {
    await this.rolesRepo.assignRoleToUser(userId, roleId, assignedBy);
  }
}
