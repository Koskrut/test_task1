import { TicketResponseDto } from './ticket-response.dto';

export class TicketListResponseDto {
  items!: TicketResponseDto[];
  page!: number;
  limit!: number;
  total!: number;
}
