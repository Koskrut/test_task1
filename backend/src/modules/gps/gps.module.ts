import { Module } from '@nestjs/common';
import {
  DEVICE_SESSIONS_REPOSITORY,
  GEOFENCES_REPOSITORY,
  GPS_LOGS_REPOSITORY,
  VISIT_EVENTS_REPOSITORY,
  VISITS_REPOSITORY,
} from '../../common/constants/tokens';
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { PrismaDeviceSessionsRepository } from './infrastructure/prisma-device-sessions.repository';
import { PrismaGeofencesRepository } from './infrastructure/prisma-geofences.repository';
import { PrismaGpsLogsRepository } from './infrastructure/prisma-gps-logs.repository';
import { PrismaVisitEventsRepository } from './infrastructure/prisma-visit-events.repository';
import { PrismaVisitsRepository } from './infrastructure/prisma-visits.repository';

@Module({
  controllers: [GpsController, VisitsController],
  providers: [
    GpsService,
    VisitsService,
    {
      provide: GPS_LOGS_REPOSITORY,
      useClass: PrismaGpsLogsRepository,
    },
    {
      provide: VISIT_EVENTS_REPOSITORY,
      useClass: PrismaVisitEventsRepository,
    },
    {
      provide: VISITS_REPOSITORY,
      useClass: PrismaVisitsRepository,
    },
    {
      provide: GEOFENCES_REPOSITORY,
      useClass: PrismaGeofencesRepository,
    },
    {
      provide: DEVICE_SESSIONS_REPOSITORY,
      useClass: PrismaDeviceSessionsRepository,
    },
  ],
})
export class GpsModule {}
