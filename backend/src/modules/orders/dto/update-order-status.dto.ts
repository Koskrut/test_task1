import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../common/types/status';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
