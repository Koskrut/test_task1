import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsUUID()
  clientId: string;

  @IsOptional()
  @IsUUID()
  managerId?: string;

  @IsOptional()
  @IsString()
  @Length(2, 32)
  source?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
