export interface TicketRecord {
  id: string;
  status: string;
  createdAt: Date;
  lastMessageAt: Date | null;
}

export interface MessageRecord {
  id: string;
  senderId: string;
  body: string | null;
  attachmentId: string | null;
  createdAt: Date;
}

export interface ClientSupportRepository {
  listTickets(
    clientId: string,
    filter: { status?: string | null },
    pagination: { skip: number; take: number },
  ): Promise<{ items: TicketRecord[]; total: number }>;
  createTicket(
    clientId: string,
    initialMessage: { senderId: string; body: string; attachmentId?: string },
  ): Promise<TicketRecord>;
  listMessages(
    clientId: string,
    ticketId: string,
    pagination: { skip: number; take: number },
  ): Promise<{ items: MessageRecord[]; total: number }>;
  createMessage(
    clientId: string,
    ticketId: string,
    message: { senderId: string; body: string; attachmentId?: string },
  ): Promise<MessageRecord>;
  findTicket(clientId: string, ticketId: string): Promise<TicketRecord | null>;
}
