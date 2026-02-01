import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/users.types';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';
import { RoleEntity } from './rbac.types';

@Controller('rbac/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles(UserRole.Admin)
  create(@Body() dto: CreateRoleDto): Promise<RoleEntity> {
    return this.rolesService.create(dto);
  }

  @Get()
  @Roles(UserRole.Admin)
  list(): Promise<RoleEntity[]> {
    return this.rolesService.list();
  }

  @Post(':roleId/permissions')
  @Roles(UserRole.Admin)
  assignPermission(
    @Param('roleId') roleId: string,
    @Body() dto: AssignPermissionDto,
  ): Promise<void> {
    return this.rolesService.assignPermission(roleId, dto.permissionId);
  }

  @Post('users/:userId')
  @Roles(UserRole.Admin)
  assignRoleToUser(
    @Param('userId') userId: string,
    @Body() dto: AssignRoleDto,
  ): Promise<void> {
    return this.rolesService.assignRoleToUser(
      userId,
      dto.roleId,
      dto.assignedBy,
    );
  }
}
