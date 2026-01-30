import { GeofenceHit } from '../gps.types';

export interface GeofencesRepository {
  findInsideGeofences(
    managerId: string,
    lat: number,
    lng: number,
  ): Promise<GeofenceHit[]>;
  isPointInsideGeofence(
    geofenceId: string,
    lat: number,
    lng: number,
  ): Promise<boolean>;
  isManagerAssignedToClient(
    managerId: string,
    clientId: string,
  ): Promise<boolean>;
}
