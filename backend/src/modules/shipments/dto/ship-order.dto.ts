import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum PayerType {
  Sender = 'Sender',
  Recipient = 'Recipient',
}

export class ShipOrderDto {
  @IsString()
  senderWarehouseRef!: string;

  @IsString()
  recipientCityRef!: string;

  @IsString()
  recipientWarehouseRef!: string;

  @IsString()
  recipientName!: string;

  @IsString()
  recipientPhone!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  weightKg!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  seatsAmount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PayerType)
  payerType?: PayerType;
}
