export class DocumentDownloadResponseDto {
  id: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: string | null;
  downloadUrl: string;
}
