import { Inject, Injectable } from '@nestjs/common';
import { PERMISSIONS_REPOSITORY } from '../../common/constants/tokens';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsRepository } from './repositories/permissions.repository';
import { PermissionEntity } from './rbac.types';

@Injectable()
export class PermissionsService {
  constructor(
    @Inject(PERMISSIONS_REPOSITORY)
    private readonly permissionsRepo: PermissionsRepository,
  ) {}

  create(dto: CreatePermissionDto): Promise<PermissionEntity> {
    return this.permissionsRepo.create({
      code: dto.code,
      description: dto.description ?? null,
      module: dto.module ?? null,
    });
  }

  list(): Promise<PermissionEntity[]> {
    return this.permissionsRepo.findAll();
  }

  async assignPermissionToUser(
    userId: string,
    permissionId: string,
    grantedBy?: string,
  ): Promise<void> {
    await this.permissionsRepo.assignPermissionToUser(
      userId,
      permissionId,
      grantedBy,
    );
  }
}
