export class MessageResponseDto {
  id!: string;
  senderId!: string;
  body!: string | null;
  attachmentId!: string | null;
  createdAt!: Date;
}
