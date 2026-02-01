import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/users.types';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';
import { PermissionEntity } from './rbac.types';

@Controller('rbac/permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles(UserRole.Admin)
  create(@Body() dto: CreatePermissionDto): Promise<PermissionEntity> {
    return this.permissionsService.create(dto);
  }

  @Get()
  @Roles(UserRole.Admin)
  list(): Promise<PermissionEntity[]> {
    return this.permissionsService.list();
  }

  @Post('users/:userId')
  @Roles(UserRole.Admin)
  assignPermissionToUser(
    @Param('userId') userId: string,
    @Body() dto: AssignPermissionDto,
  ): Promise<void> {
    return this.permissionsService.assignPermissionToUser(
      userId,
      dto.permissionId,
      dto.assignedBy,
    );
  }
}
