import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../../common/types/status';
import { PaginationQueryDto } from './pagination-query.dto';

export class OrderListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
