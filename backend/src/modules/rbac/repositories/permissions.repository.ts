import { PermissionEntity } from '../rbac.types';

export interface CreatePermissionInput {
  code: string;
  description?: string | null;
  module?: string | null;
}

export interface PermissionsRepository {
  create(data: CreatePermissionInput): Promise<PermissionEntity>;
  findAll(): Promise<PermissionEntity[]>;
  assignPermissionToUser(
    userId: string,
    permissionId: string,
    grantedBy?: string | null,
  ): Promise<void>;
}
