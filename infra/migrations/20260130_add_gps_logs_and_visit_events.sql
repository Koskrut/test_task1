-- Add GPS logs and visit events (schema extension)

CREATE TABLE IF NOT EXISTS gps_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id varchar(128) NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  accuracy_m double precision,
  speed_kmh double precision,
  is_mocked boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_gps_logs_user_time ON gps_logs(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_gps_logs_device_time ON gps_logs(device_id, recorded_at);

CREATE TABLE IF NOT EXISTS visit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES visits(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  geofence_id uuid REFERENCES geofences(id) ON DELETE SET NULL,
  gps_log_id uuid REFERENCES gps_logs(id) ON DELETE SET NULL,
  event_type varchar(32) NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visit_events_user_time ON visit_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_visit_events_geofence_time ON visit_events(geofence_id, created_at);
CREATE INDEX IF NOT EXISTS idx_visit_events_visit_time ON visit_events(visit_id, created_at);
