export interface CreateWebhookEventInput {
  provider: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface WebhookEventsRepository {
  create(data: CreateWebhookEventInput): Promise<void>;
}
