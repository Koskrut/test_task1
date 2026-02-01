export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Client = 'client',
  Logistics = 'logistics',
}

export enum UserStatus {
  Active = 'active',
  Blocked = 'blocked',
  Pending = 'pending',
}

export interface UserEntity {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface CreateUserInput {
  email?: string | null;
  phone?: string | null;
  passwordHash: string;
  role: UserRole;
  status?: UserStatus;
}

export interface UpdateUserInput {
  email?: string | null;
  phone?: string | null;
  passwordHash?: string;
  role?: UserRole;
  status?: UserStatus;
}
