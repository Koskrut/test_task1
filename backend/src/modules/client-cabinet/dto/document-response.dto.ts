export class DocumentResponseDto {
  id: string;
  title: string;
  documentType: string | null;
  createdAt: Date;
  fileName: string;
  mimeType: string | null;
  sizeBytes: string | null;
}
