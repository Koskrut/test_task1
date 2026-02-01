import { IsOptional, IsString, Length } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class TicketListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 32)
  status?: string;
}
