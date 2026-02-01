import { IsOptional, IsString, Length } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @Length(1, 2000)
  message!: string;

  @IsOptional()
  @IsString()
  attachmentId?: string;
}
