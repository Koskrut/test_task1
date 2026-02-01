import { ClientOrderSummaryDto } from './client-order-summary.dto';

export class DashboardResponseDto {
  activeOrders: ClientOrderSummaryDto[];
  stats: {
    totalOrders: number;
    activeOrders: number;
  };
}
