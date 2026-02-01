import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  ClientSupportRepository,
  MessageRecord,
  TicketRecord,
} from '../repositories/client-support.repository';

@Injectable()
export class PrismaClientSupportRepository implements ClientSupportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listTickets(
    clientId: string,
    filter: { status?: string | null },
    pagination: { skip: number; take: number },
  ): Promise<{ items: TicketRecord[]; total: number }> {
    const where = {
      clientId,
      ...(filter.status ? { status: filter.status } : {}),
    };

    const [tickets, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      items: tickets.map((ticket) => ({
        id: ticket.id,
        status: ticket.status,
        createdAt: ticket.createdAt,
        lastMessageAt: ticket.messages[0]?.createdAt ?? null,
      })),
      total,
    };
  }

  async createTicket(
    clientId: string,
    initialMessage: { senderId: string; body: string; attachmentId?: string },
  ): Promise<TicketRecord> {
    const ticket = await this.prisma.conversation.create({
      data: {
        clientId,
        status: 'open',
        messages: {
          create: {
            senderId: initialMessage.senderId,
            body: initialMessage.body,
            attachmentId: initialMessage.attachmentId ?? null,
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return {
      id: ticket.id,
      status: ticket.status,
      createdAt: ticket.createdAt,
      lastMessageAt: ticket.messages[0]?.createdAt ?? null,
    };
  }

  async listMessages(
    clientId: string,
    ticketId: string,
    pagination: { skip: number; take: number },
  ): Promise<{ items: MessageRecord[]; total: number }> {
    const ticket = await this.prisma.conversation.findFirst({
      where: { id: ticketId, clientId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: { conversationId: ticketId },
        orderBy: { createdAt: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.message.count({ where: { conversationId: ticketId } }),
    ]);

    return {
      items: messages.map((msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        body: msg.body,
        attachmentId: msg.attachmentId,
        createdAt: msg.createdAt,
      })),
      total,
    };
  }

  async createMessage(
    clientId: string,
    ticketId: string,
    message: { senderId: string; body: string; attachmentId?: string },
  ): Promise<MessageRecord> {
    const ticket = await this.prisma.conversation.findFirst({
      where: { id: ticketId, clientId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const created = await this.prisma.message.create({
      data: {
        conversationId: ticketId,
        senderId: message.senderId,
        body: message.body,
        attachmentId: message.attachmentId ?? null,
      },
    });

    return {
      id: created.id,
      senderId: created.senderId,
      body: created.body,
      attachmentId: created.attachmentId,
      createdAt: created.createdAt,
    };
  }

  async findTicket(
    clientId: string,
    ticketId: string,
  ): Promise<TicketRecord | null> {
    const ticket = await this.prisma.conversation.findFirst({
      where: { id: ticketId, clientId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!ticket) {
      return null;
    }

    return {
      id: ticket.id,
      status: ticket.status,
      createdAt: ticket.createdAt,
      lastMessageAt: ticket.messages[0]?.createdAt ?? null,
    };
  }
}
