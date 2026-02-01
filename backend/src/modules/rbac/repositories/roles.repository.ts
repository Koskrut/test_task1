import { RoleEntity } from '../rbac.types';

export interface CreateRoleInput {
  name: string;
  description?: string | null;
  isSystem?: boolean;
}

export interface RolesRepository {
  create(data: CreateRoleInput): Promise<RoleEntity>;
  findAll(): Promise<RoleEntity[]>;
  addPermission(roleId: string, permissionId: string): Promise<void>;
  assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy?: string | null,
  ): Promise<void>;
}
