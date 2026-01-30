export default () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtlSeconds: Number(process.env.JWT_ACCESS_TTL || 900),
    refreshTtlSeconds: Number(process.env.JWT_REFRESH_TTL || 2592000),
  },
  gps: {
    dwellSeconds: Number(process.env.GPS_DWELL_SECONDS || 120),
    maxAccuracyMeters: Number(process.env.GPS_MAX_ACCURACY_METERS || 100),
    maxSpeedKmh: Number(process.env.GPS_MAX_SPEED_KMH || 180),
    maxTeleportSpeedKmh: Number(
      process.env.GPS_MAX_TELEPORT_SPEED_KMH || 240,
    ),
  },
});
