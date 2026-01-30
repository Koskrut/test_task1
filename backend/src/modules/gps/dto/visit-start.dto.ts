import { IsOptional, IsUUID } from 'class-validator';

export class VisitStartDto {
  @IsUUID()
  clientId: string;

  @IsOptional()
  @IsUUID()
  geofenceId?: string;
}
