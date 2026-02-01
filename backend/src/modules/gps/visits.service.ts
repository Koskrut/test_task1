import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VisitStatus } from '../../common/types/status';
import {
  GEOFENCES_REPOSITORY,
  GPS_LOGS_REPOSITORY,
  VISIT_EVENTS_REPOSITORY,
  VISITS_REPOSITORY,
} from '../../common/constants/tokens';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { VisitDetailResponseDto } from './dto/visit-detail-response.dto';
import { VisitEventResponseDto } from './dto/visit-event-response.dto';
import { VisitFinishDto } from './dto/visit-finish.dto';
import { VisitResponseDto } from './dto/visit-response.dto';
import { VisitStartDto } from './dto/visit-start.dto';
import { VISIT_EVENT_TYPE } from './gps.constants';
import { GeofencesRepository } from './repositories/geofences.repository';
import { GpsLogsRepository } from './repositories/gps-logs.repository';
import { VisitEventsRepository } from './repositories/visit-events.repository';
import { VisitsRepository } from './repositories/visits.repository';

@Injectable()
export class VisitsService {
  constructor(
    @Inject(VISITS_REPOSITORY)
    private readonly visitsRepo: VisitsRepository,
    @Inject(VISIT_EVENTS_REPOSITORY)
    private readonly visitEventsRepo: VisitEventsRepository,
    @Inject(GEOFENCES_REPOSITORY)
    private readonly geofencesRepo: GeofencesRepository,
    @Inject(GPS_LOGS_REPOSITORY)
    private readonly gpsLogsRepo: GpsLogsRepository,
  ) {}

  async startManual(
    userId: string,
    dto: VisitStartDto,
  ): Promise<VisitResponseDto> {
    const isAssigned = await this.geofencesRepo.isManagerAssignedToClient(
      userId,
      dto.clientId,
    );
    if (!isAssigned) {
      throw new ForbiddenException('Client is not assigned to this manager');
    }

    const active = await this.visitsRepo.findActiveForManagerClient(
      userId,
      dto.clientId,
    );
    if (active) {
      throw new BadRequestException('Active visit already exists');
    }

    const lastLog = await this.gpsLogsRepo.findLatestByUser(userId);
    if (dto.geofenceId) {
      if (!lastLog) {
        throw new BadRequestException('No GPS data for geofence validation');
      }
      const isInside = await this.geofencesRepo.isPointInsideGeofence(
        dto.geofenceId,
        lastLog.lat,
        lastLog.lng,
      );
      if (!isInside) {
        throw new BadRequestException('User is outside the geofence');
      }
    }

    const visit = await this.visitsRepo.create({
      managerId: userId,
      clientId: dto.clientId,
      startedAt: new Date(),
      status: VisitStatus.started,
    });

    await this.visitEventsRepo.create({
      visitId: visit.id,
      userId,
      clientId: dto.clientId,
      geofenceId: dto.geofenceId ?? null,
      gpsLogId: lastLog?.id ?? null,
      eventType: VISIT_EVENT_TYPE.ManualStarted,
      payload: { manual: true },
    });

    return this.toResponse(visit);
  }

  async finishManual(
    userId: string,
    dto: VisitFinishDto,
  ): Promise<VisitResponseDto> {
    if (!dto.visitId && !dto.clientId) {
      throw new BadRequestException('visitId or clientId is required');
    }

    let visit = dto.visitId
      ? await this.visitsRepo.findById(dto.visitId)
      : await this.visitsRepo.findActiveForManagerClient(
          userId,
          dto.clientId as string,
        );

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    if (visit.managerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (visit.status !== VisitStatus.started) {
      throw new BadRequestException('Visit is not active');
    }

    const endedAt = new Date();
    visit = await this.visitsRepo.finish(visit.id, {
      endedAt,
      status: VisitStatus.completed,
    });

    const durationSeconds = visit.startedAt
      ? Math.max(
          0,
          Math.floor(
            (endedAt.getTime() - visit.startedAt.getTime()) / 1000,
          ),
        )
      : 0;

    await this.visitEventsRepo.create({
      visitId: visit.id,
      userId,
      clientId: visit.clientId,
      eventType: VISIT_EVENT_TYPE.ManualEnded,
      payload: { manual: true, durationSeconds },
    });

    return this.toResponse(visit);
  }

  async listMyVisits(userId: string): Promise<VisitResponseDto[]> {
    const visits = await this.visitsRepo.listByManager(userId);
    return visits.map((visit) => this.toResponse(visit));
  }

  async getVisit(
    user: JwtPayload,
    visitId: string,
  ): Promise<VisitDetailResponseDto> {
    const visit = await this.visitsRepo.findById(visitId);
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    if (user.role !== UserRole.Admin && visit.managerId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }

    const events = await this.visitEventsRepo.listByVisit(visit.id);
    return {
      ...this.toResponse(visit),
      events: events.map((event) => this.toEventResponse(event)),
    };
  }

  private toResponse(visit: {
    id: string;
    managerId: string;
    clientId: string;
    status: VisitStatus;
    startedAt: Date | null;
    endedAt: Date | null;
    createdAt: Date;
  }): VisitResponseDto {
    return {
      id: visit.id,
      managerId: visit.managerId,
      clientId: visit.clientId,
      status: visit.status,
      startedAt: visit.startedAt,
      endedAt: visit.endedAt,
      createdAt: visit.createdAt,
    };
  }

  private toEventResponse(event: {
    id: string;
    eventType: string;
    createdAt: Date;
    payload: Record<string, unknown>;
  }): VisitEventResponseDto {
    return {
      id: event.id,
      eventType: event.eventType,
      createdAt: event.createdAt,
      payload: event.payload,
    };
  }
}
