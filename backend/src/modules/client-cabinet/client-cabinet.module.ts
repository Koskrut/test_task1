import { Module } from '@nestjs/common';
import { AUDIT_LOGS_REPOSITORY } from '../../common/constants/tokens';
import { PrismaAuditLogsRepository } from '../../common/infrastructure/prisma-audit-logs.repository';
import { ClientOrdersController } from './client-orders.controller';
import { ClientDocumentsController } from './client-documents.controller';
import { ClientProfileController } from './client-profile.controller';
import { ClientSupportController } from './client-support.controller';
import { DashboardController } from './dashboard.controller';
import { ClientContextService } from './client-context.service';
import { ClientDocumentsService } from './client-documents.service';
import { ClientOrdersService } from './client-orders.service';
import { ClientProfileService } from './client-profile.service';
import { ClientSupportService } from './client-support.service';
import { DashboardService } from './dashboard.service';
import {
  CLIENT_DOCUMENTS_REPOSITORY,
  CLIENT_IDENTITY_REPOSITORY,
  CLIENT_ORDERS_REPOSITORY,
  CLIENT_PREFERENCES_REPOSITORY,
  CLIENT_PROFILE_REPOSITORY,
  CLIENT_SUPPORT_REPOSITORY,
} from './client-cabinet.tokens';
import { PrismaClientDocumentsRepository } from './infrastructure/prisma-client-documents.repository';
import { PrismaClientIdentityRepository } from './infrastructure/prisma-client-identity.repository';
import { PrismaClientOrdersRepository } from './infrastructure/prisma-client-orders.repository';
import { PrismaClientPreferencesRepository } from './infrastructure/prisma-client-preferences.repository';
import { PrismaClientProfileRepository } from './infrastructure/prisma-client-profile.repository';
import { PrismaClientSupportRepository } from './infrastructure/prisma-client-support.repository';

@Module({
  controllers: [
    DashboardController,
    ClientOrdersController,
    ClientDocumentsController,
    ClientSupportController,
    ClientProfileController,
  ],
  providers: [
    ClientContextService,
    DashboardService,
    ClientOrdersService,
    ClientDocumentsService,
    ClientSupportService,
    ClientProfileService,
    {
      provide: CLIENT_IDENTITY_REPOSITORY,
      useClass: PrismaClientIdentityRepository,
    },
    {
      provide: CLIENT_ORDERS_REPOSITORY,
      useClass: PrismaClientOrdersRepository,
    },
    {
      provide: CLIENT_DOCUMENTS_REPOSITORY,
      useClass: PrismaClientDocumentsRepository,
    },
    {
      provide: CLIENT_SUPPORT_REPOSITORY,
      useClass: PrismaClientSupportRepository,
    },
    {
      provide: CLIENT_PROFILE_REPOSITORY,
      useClass: PrismaClientProfileRepository,
    },
    {
      provide: CLIENT_PREFERENCES_REPOSITORY,
      useClass: PrismaClientPreferencesRepository,
    },
    {
      provide: AUDIT_LOGS_REPOSITORY,
      useClass: PrismaAuditLogsRepository,
    },
  ],
})
export class ClientCabinetModule {}
