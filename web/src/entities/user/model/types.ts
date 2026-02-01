export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
}

export interface AuthUser {
  id: string
  role: UserRole
  name?: string
}
