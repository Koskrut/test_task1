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
  novaPoshta: {
    apiKey: process.env.NOVA_POSHTA_API_KEY,
    baseUrl:
      process.env.NOVA_POSHTA_BASE_URL ||
      'https://api.novaposhta.ua/v2.0/json/',
    requestTimeoutMs: Number(process.env.NOVA_POSHTA_TIMEOUT_MS || 8000),
    retryCount: Number(process.env.NOVA_POSHTA_RETRY_COUNT || 3),
    retryDelayMs: Number(process.env.NOVA_POSHTA_RETRY_DELAY_MS || 500),
    senderRef: process.env.NOVA_POSHTA_SENDER_REF,
    senderContactRef: process.env.NOVA_POSHTA_SENDER_CONTACT_REF,
    senderPhone: process.env.NOVA_POSHTA_SENDER_PHONE,
    senderCityRef: process.env.NOVA_POSHTA_SENDER_CITY_REF,
  },
});
