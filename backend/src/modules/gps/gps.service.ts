import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VisitStatus } from '@prisma/client';
import {
  DEVICE_SESSIONS_REPOSITORY,
  GEOFENCES_REPOSITORY,
  GPS_LOGS_REPOSITORY,
  VISIT_EVENTS_REPOSITORY,
  VISITS_REPOSITORY,
} from '../../common/constants/tokens';
import { GpsPingDto } from './dto/gps-ping.dto';
import { GpsPingResponseDto } from './dto/gps-ping-response.dto';
import { VISIT_EVENT_TYPE } from './gps.constants';
import { DeviceSessionsRepository } from './repositories/device-sessions.repository';
import { GeofencesRepository } from './repositories/geofences.repository';
import { GpsLogsRepository } from './repositories/gps-logs.repository';
import { VisitEventsRepository } from './repositories/visit-events.repository';
import { VisitsRepository } from './repositories/visits.repository';

@Injectable()
export class GpsService {
  private readonly dwellSeconds: number;
  private readonly maxAccuracyMeters: number;
  private readonly maxSpeedKmh: number;
  private readonly maxTeleportSpeedKmh: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(GPS_LOGS_REPOSITORY)
    private readonly gpsLogsRepo: GpsLogsRepository,
    @Inject(VISIT_EVENTS_REPOSITORY)
    private readonly visitEventsRepo: VisitEventsRepository,
    @Inject(VISITS_REPOSITORY)
    private readonly visitsRepo: VisitsRepository,
    @Inject(GEOFENCES_REPOSITORY)
    private readonly geofencesRepo: GeofencesRepository,
    @Inject(DEVICE_SESSIONS_REPOSITORY)
    private readonly deviceSessionsRepo: DeviceSessionsRepository,
  ) {
    this.dwellSeconds =
      this.configService.get<number>('gps.dwellSeconds') ?? 120;
    this.maxAccuracyMeters =
      this.configService.get<number>('gps.maxAccuracyMeters') ?? 100;
    this.maxSpeedKmh =
      this.configService.get<number>('gps.maxSpeedKmh') ?? 180;
    this.maxTeleportSpeedKmh =
      this.configService.get<number>('gps.maxTeleportSpeedKmh') ?? 240;
  }

  async ping(userId: string, dto: GpsPingDto): Promise<GpsPingResponseDto> {
    await this.ensureTrustedDevice(userId, dto.device_id);
    this.validateSignal(dto);

    const now = new Date();
    const lastLog = await this.gpsLogsRepo.findLatestByUser(userId);
    if (lastLog) {
      await this.detectTeleport(lastLog, dto, now);
    }

    const gpsLog = await this.gpsLogsRepo.create({
      userId,
      deviceId: dto.device_id,
      lat: dto.lat,
      lng: dto.lng,
      accuracyM: dto.accuracy,
      speedKmh: dto.speed,
      isMocked: dto.is_mocked ?? false,
    });

    const insideGeofences = await this.geofencesRepo.findInsideGeofences(
      userId,
      dto.lat,
      dto.lng,
    );
    const insideByGeofence = new Set(
      insideGeofences.map((item) => item.geofenceId),
    );
    const insideByClient = new Map<string, number>();
    insideGeofences.forEach((item) => {
      insideByClient.set(
        item.clientId,
        (insideByClient.get(item.clientId) ?? 0) + 1,
      );
    });

    const lastEvents = await this.visitEventsRepo.findLastEventsForUser(userId);
    const lastEventByGeofence = new Map(
      lastEvents.map((event) => [event.geofenceId, event]),
    );

    let visitStarted = false;
    let activeVisitId: string | undefined;

    for (const geofence of insideGeofences) {
      const lastEvent = lastEventByGeofence.get(geofence.geofenceId);
      let enteredAt = lastEvent?.eventType === VISIT_EVENT_TYPE.Enter
        ? lastEvent.createdAt
        : null;

      if (!enteredAt) {
        await this.visitEventsRepo.create({
          userId,
          clientId: geofence.clientId,
          geofenceId: geofence.geofenceId,
          gpsLogId: gpsLog.id,
          eventType: VISIT_EVENT_TYPE.Enter,
          payload: { auto: true },
        });
        enteredAt = now;
      }

      const dwellMs = now.getTime() - enteredAt.getTime();
      if (dwellMs >= this.dwellSeconds * 1000) {
        const activeVisit = await this.visitsRepo.findActiveForManagerClient(
          userId,
          geofence.clientId,
        );
        if (!activeVisit) {
          const visit = await this.visitsRepo.create({
            managerId: userId,
            clientId: geofence.clientId,
            startedAt: now,
            status: VisitStatus.started,
          });
          await this.visitEventsRepo.create({
            visitId: visit.id,
            userId,
            clientId: geofence.clientId,
            geofenceId: geofence.geofenceId,
            gpsLogId: gpsLog.id,
            eventType: VISIT_EVENT_TYPE.VisitStarted,
            payload: {
              auto: true,
              dwellSeconds: Math.floor(dwellMs / 1000),
            },
          });
          visitStarted = true;
          activeVisitId = visit.id;
        }
      }
    }

    for (const lastEvent of lastEvents) {
      if (lastEvent.eventType !== VISIT_EVENT_TYPE.Enter) {
        continue;
      }
      if (insideByGeofence.has(lastEvent.geofenceId)) {
        continue;
      }

      await this.visitEventsRepo.create({
        userId,
        clientId: lastEvent.clientId,
        geofenceId: lastEvent.geofenceId,
        gpsLogId: gpsLog.id,
        eventType: VISIT_EVENT_TYPE.Exit,
        payload: { auto: true },
      });

      if (insideByClient.get(lastEvent.clientId)) {
        continue;
      }

      const activeVisit = await this.visitsRepo.findActiveForManagerClient(
        userId,
        lastEvent.clientId,
      );
      if (!activeVisit) {
        continue;
      }

      const endedAt = now;
      const updated = await this.visitsRepo.finish(activeVisit.id, {
        endedAt,
        status: VisitStatus.completed,
      });
      const durationSeconds = updated.startedAt
        ? Math.max(
            0,
            Math.floor(
              (endedAt.getTime() - updated.startedAt.getTime()) / 1000,
            ),
          )
        : 0;
      await this.visitEventsRepo.create({
        visitId: updated.id,
        userId,
        clientId: lastEvent.clientId,
        geofenceId: lastEvent.geofenceId,
        gpsLogId: gpsLog.id,
        eventType: VISIT_EVENT_TYPE.VisitEnded,
        payload: { auto: true, durationSeconds },
      });
    }

    return {
      id: gpsLog.id,
      insideGeofences: insideGeofences.length,
      visitStarted,
      activeVisitId,
    };
  }

  private validateSignal(dto: GpsPingDto): void {
    if (dto.is_mocked) {
      throw new BadRequestException('Mock locations are not allowed');
    }
    if (dto.accuracy > this.maxAccuracyMeters) {
      throw new BadRequestException('GPS accuracy is too low');
    }
    if (dto.speed > this.maxSpeedKmh) {
      throw new BadRequestException('Speed is not realistic');
    }
  }

  private async detectTeleport(
    lastLog: { lat: number; lng: number; recordedAt: Date },
    dto: GpsPingDto,
    now: Date,
  ): Promise<void> {
    const seconds =
      (now.getTime() - lastLog.recordedAt.getTime()) / 1000;
    if (seconds <= 0) {
      return;
    }

    const distanceMeters = await this.gpsLogsRepo.calculateDistanceMeters(
      lastLog.lat,
      lastLog.lng,
      dto.lat,
      dto.lng,
    );
    const speedKmh = (distanceMeters / seconds) * 3.6;
    if (speedKmh > this.maxTeleportSpeedKmh) {
      throw new BadRequestException('Teleporting detected');
    }
  }

  private async ensureTrustedDevice(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const session = await this.deviceSessionsRepo.findTrustedSession(
      userId,
      deviceId,
    );
    if (!session || !session.isTrusted) {
      throw new ForbiddenException('Untrusted device session');
    }
  }
}
