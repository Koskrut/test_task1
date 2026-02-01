export interface CreateSessionInput {
  userId: string;
  refreshTokenHash: string;
  deviceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

export interface SessionRecord {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface SessionsRepository {
  create(data: CreateSessionInput): Promise<SessionRecord>;
  findByTokenHash(refreshTokenHash: string): Promise<SessionRecord | null>;
  rotate(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<SessionRecord>;
  revoke(sessionId: string): Promise<void>;
}
