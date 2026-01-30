import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateVisitEventInput,
  LastGeofenceEventRecord,
  VisitEventEntity,
  VisitEventsRepository,
} from '../repositories/visit-events.repository';

@Injectable()
export class PrismaVisitEventsRepository implements VisitEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVisitEventInput): Promise<VisitEventEntity> {
    return this.prisma.visitEvent.create({
      data: {
        visitId: data.visitId ?? null,
        userId: data.userId,
        clientId: data.clientId,
        geofenceId: data.geofenceId ?? null,
        gpsLogId: data.gpsLogId ?? null,
        eventType: data.eventType,
        payload: data.payload ?? {},
      },
    });
  }

  async listByVisit(visitId: string): Promise<VisitEventEntity[]> {
    return this.prisma.visitEvent.findMany({
      where: { visitId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findLastEventsForUser(
    userId: string,
  ): Promise<LastGeofenceEventRecord[]> {
    return this.prisma.$queryRaw<LastGeofenceEventRecord[]>`
      SELECT DISTINCT ON (geofence_id)
        geofence_id AS "geofenceId",
        client_id AS "clientId",
        event_type AS "eventType",
        created_at AS "createdAt"
      FROM visit_events
      WHERE user_id = ${userId}
        AND geofence_id IS NOT NULL
        AND event_type IN ('enter', 'exit')
      ORDER BY geofence_id, created_at DESC
    `;
  }
}
