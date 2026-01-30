import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceAmount: number;
}
