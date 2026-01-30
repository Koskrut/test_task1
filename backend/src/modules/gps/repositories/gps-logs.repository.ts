export interface GpsLogEntity {
  id: string;
  userId: string;
  deviceId: string;
  recordedAt: Date;
  lat: number;
  lng: number;
  accuracyM: number | null;
  speedKmh: number | null;
  isMocked: boolean;
}

export interface CreateGpsLogInput {
  userId: string;
  deviceId: string;
  lat: number;
  lng: number;
  accuracyM: number;
  speedKmh: number;
  isMocked: boolean;
}

export interface GpsLogsRepository {
  create(data: CreateGpsLogInput): Promise<GpsLogEntity>;
  findLatestByUser(userId: string): Promise<GpsLogEntity | null>;
  calculateDistanceMeters(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): Promise<number>;
}
