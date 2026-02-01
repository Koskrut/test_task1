import { IsOptional, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @IsUUID()
  permissionId!: string;

  @IsOptional()
  @IsUUID()
  assignedBy?: string;
}
