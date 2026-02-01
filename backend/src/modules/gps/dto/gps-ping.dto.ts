import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class GpsPingDto {
  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @Type(() => Number)
  @IsLongitude()
  lng!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  accuracy!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  speed!: number;

  @IsString()
  @IsNotEmpty()
  device_id!: string;

  @IsOptional()
  @IsBoolean()
  is_mocked?: boolean;
}
