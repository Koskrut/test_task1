import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { PaginationQueryDto } from './pagination-query.dto';

export class OrderListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
