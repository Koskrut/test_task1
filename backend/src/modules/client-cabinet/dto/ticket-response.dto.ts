export class TicketResponseDto {
  id: string;
  status: string;
  createdAt: Date;
  lastMessageAt: Date | null;
}
