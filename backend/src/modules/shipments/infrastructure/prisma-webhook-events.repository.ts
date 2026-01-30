import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  CreateWebhookEventInput,
  WebhookEventsRepository,
} from '../repositories/webhook-events.repository';

@Injectable()
export class PrismaWebhookEventsRepository implements WebhookEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWebhookEventInput): Promise<void> {
    await this.prisma.webhookEvent.create({
      data: {
        provider: data.provider,
        eventType: data.eventType,
        payload: data.payload,
      },
    });
  }
}
