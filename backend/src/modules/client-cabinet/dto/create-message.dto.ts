import { IsOptional, IsString, Length } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @Length(1, 2000)
  body: string;

  @IsOptional()
  @IsString()
  attachmentId?: string;
}
