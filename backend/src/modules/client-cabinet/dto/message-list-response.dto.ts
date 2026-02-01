import { MessageResponseDto } from './message-response.dto';

export class MessageListResponseDto {
  items: MessageResponseDto[];
  page: number;
  limit: number;
  total: number;
}
