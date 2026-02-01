export interface RoleEntity {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
}

export interface PermissionEntity {
  id: string;
  code: string;
  description: string | null;
  module: string | null;
  createdAt: Date;
}
