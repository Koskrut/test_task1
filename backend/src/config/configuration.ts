export default () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtlSeconds: Number(process.env.JWT_ACCESS_TTL || 900),
    refreshTtlSeconds: Number(process.env.JWT_REFRESH_TTL || 2592000),
  },
});
