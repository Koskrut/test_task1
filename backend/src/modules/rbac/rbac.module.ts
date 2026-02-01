import { Module } from '@nestjs/common';
import {
  PERMISSIONS_REPOSITORY,
  ROLES_REPOSITORY,
} from '../../common/constants/tokens';
import { PrismaPermissionsRepository } from './infrastructure/prisma-permissions.repository';
import { PrismaRolesRepository } from './infrastructure/prisma-roles.repository';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  controllers: [RolesController, PermissionsController],
  providers: [
    RolesService,
    PermissionsService,
    {
      provide: ROLES_REPOSITORY,
      useClass: PrismaRolesRepository,
    },
    {
      provide: PERMISSIONS_REPOSITORY,
      useClass: PrismaPermissionsRepository,
    },
  ],
})
export class RbacModule {}
