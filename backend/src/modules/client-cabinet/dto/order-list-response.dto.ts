import { ClientOrderSummaryDto } from './client-order-summary.dto';

export class OrderListResponseDto {
  items: ClientOrderSummaryDto[];
  page: number;
  limit: number;
  total: number;
}
