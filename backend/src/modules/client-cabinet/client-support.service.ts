import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_LOGS_REPOSITORY } from '../../common/constants/tokens';
import { AuditLogsRepository } from '../../common/repositories/audit-logs.repository';
import { ClientContextService } from './client-context.service';
import { CLIENT_SUPPORT_REPOSITORY } from './client-cabinet.tokens';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { MessageListResponseDto } from './dto/message-list-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { TicketListQueryDto } from './dto/ticket-list-query.dto';
import { TicketListResponseDto } from './dto/ticket-list-response.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { ClientSupportRepository } from './repositories/client-support.repository';

@Injectable()
export class ClientSupportService {
  constructor(
    private readonly clientContext: ClientContextService,
    @Inject(CLIENT_SUPPORT_REPOSITORY)
    private readonly supportRepo: ClientSupportRepository,
    @Inject(AUDIT_LOGS_REPOSITORY)
    private readonly auditRepo: AuditLogsRepository,
  ) {}

  async listTickets(
    userId: string,
    query: TicketListQueryDto,
  ): Promise<TicketListResponseDto> {
    const client = await this.clientContext.requireClient(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.supportRepo.listTickets(
      client.id,
      { status: query.status ?? null },
      { skip, take: limit },
    );

    return {
      items: items.map(
        (ticket): TicketResponseDto => ({
          id: ticket.id,
          status: ticket.status,
          createdAt: ticket.createdAt,
          lastMessageAt: ticket.lastMessageAt,
        }),
      ),
      page,
      limit,
      total,
    };
  }

  async createTicket(
    userId: string,
    dto: CreateTicketDto,
  ): Promise<TicketResponseDto> {
    const client = await this.clientContext.requireClient(userId);
    const ticket = await this.supportRepo.createTicket(client.id, {
      senderId: userId,
      body: dto.message,
      attachmentId: dto.attachmentId,
    });

    await this.auditRepo.create({
      actorId: userId,
      action: 'client.support.ticket.create',
      entityType: 'conversation',
      entityId: ticket.id,
    });

    return {
      id: ticket.id,
      status: ticket.status,
      createdAt: ticket.createdAt,
      lastMessageAt: ticket.lastMessageAt,
    };
  }

  async listMessages(
    userId: string,
    ticketId: string,
    query: TicketListQueryDto,
  ): Promise<MessageListResponseDto> {
    const client = await this.clientContext.requireClient(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const { items, total } = await this.supportRepo.listMessages(
      client.id,
      ticketId,
      { skip, take: limit },
    );

    return {
      items: items.map(
        (message): MessageResponseDto => ({
          id: message.id,
          senderId: message.senderId,
          body: message.body,
          attachmentId: message.attachmentId,
          createdAt: message.createdAt,
        }),
      ),
      page,
      limit,
      total,
    };
  }

  async createMessage(
    userId: string,
    ticketId: string,
    dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const client = await this.clientContext.requireClient(userId);
    const ticket = await this.supportRepo.findTicket(client.id, ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const message = await this.supportRepo.createMessage(client.id, ticketId, {
      senderId: userId,
      body: dto.body,
      attachmentId: dto.attachmentId,
    });

    await this.auditRepo.create({
      actorId: userId,
      action: 'client.support.message.create',
      entityType: 'message',
      entityId: message.id,
    });

    return {
      id: message.id,
      senderId: message.senderId,
      body: message.body,
      attachmentId: message.attachmentId,
      createdAt: message.createdAt,
    };
  }
}
