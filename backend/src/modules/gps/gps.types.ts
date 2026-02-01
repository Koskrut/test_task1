export interface GeofenceHit {
  geofenceId: string;
  clientId: string;
}

export interface LastGeofenceEvent {
  geofenceId: string;
  clientId: string;
  eventType: string;
  createdAt: Date;
}
