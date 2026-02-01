import { IsOptional, IsString, Length } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class DocumentListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  type?: string;
}
