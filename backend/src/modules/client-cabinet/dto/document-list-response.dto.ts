import { DocumentResponseDto } from './document-response.dto';

export class DocumentListResponseDto {
  items: DocumentResponseDto[];
  page: number;
  limit: number;
  total: number;
}
