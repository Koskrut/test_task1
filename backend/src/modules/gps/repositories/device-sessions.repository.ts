export interface DeviceSessionRecord {
  id: string;
  userId: string;
  deviceId: string;
  isTrusted: boolean;
}

export interface DeviceSessionsRepository {
  findTrustedSession(
    userId: string,
    deviceId: string,
  ): Promise<DeviceSessionRecord | null>;
}
