export interface CreateAuditLogInput {
  actorId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditLogsRepository {
  create(data: CreateAuditLogInput): Promise<void>;
}
