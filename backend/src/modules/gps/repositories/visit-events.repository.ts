export interface VisitEventEntity {
  id: string;
  visitId: string | null;
  userId: string;
  clientId: string;
  geofenceId: string | null;
  gpsLogId: string | null;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateVisitEventInput {
  visitId?: string | null;
  userId: string;
  clientId: string;
  geofenceId?: string | null;
  gpsLogId?: string | null;
  eventType: string;
  payload?: Record<string, unknown>;
}

export interface LastGeofenceEventRecord {
  geofenceId: string;
  clientId: string;
  eventType: string;
  createdAt: Date;
}

export interface VisitEventsRepository {
  create(data: CreateVisitEventInput): Promise<VisitEventEntity>;
  listByVisit(visitId: string): Promise<VisitEventEntity[]>;
  findLastEventsForUser(
    userId: string,
  ): Promise<LastGeofenceEventRecord[]>;
}
