import { IsOptional, IsUUID } from 'class-validator';

export class VisitFinishDto {
  @IsOptional()
  @IsUUID()
  visitId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}
