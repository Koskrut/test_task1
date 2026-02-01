import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_LOGS_REPOSITORY } from '../../common/constants/tokens';
import { AuditLogsRepository } from '../../common/repositories/audit-logs.repository';
import { ClientContextService } from './client-context.service';
import { CLIENT_DOCUMENTS_REPOSITORY } from './client-cabinet.tokens';
import { DocumentDownloadResponseDto } from './dto/document-download-response.dto';
import { DocumentListQueryDto } from './dto/document-list-query.dto';
import { DocumentListResponseDto } from './dto/document-list-response.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { ClientDocumentsRepository } from './repositories/client-documents.repository';

@Injectable()
export class ClientDocumentsService {
  constructor(
    private readonly clientContext: ClientContextService,
    @Inject(CLIENT_DOCUMENTS_REPOSITORY)
    private readonly documentsRepo: ClientDocumentsRepository,
    @Inject(AUDIT_LOGS_REPOSITORY)
    private readonly auditRepo: AuditLogsRepository,
  ) {}

  async listDocuments(
    userId: string,
    query: DocumentListQueryDto,
  ): Promise<DocumentListResponseDto> {
    const client = await this.clientContext.requireClient(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.documentsRepo.listByClient(
      client.id,
      { type: query.type ?? null },
      { skip, take: limit },
    );

    return {
      items: items.map((doc): DocumentResponseDto => ({
        id: doc.id,
        title: doc.title,
        documentType: doc.documentType,
        createdAt: doc.createdAt,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes ? doc.sizeBytes.toString() : null,
      })),
      page,
      limit,
      total,
    };
  }

  async downloadDocument(
    userId: string,
    documentId: string,
  ): Promise<DocumentDownloadResponseDto> {
    const client = await this.clientContext.requireClient(userId);
    const doc = await this.documentsRepo.findById(client.id, documentId);
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    await this.auditRepo.create({
      actorId: userId,
      action: 'client.document.download',
      entityType: 'client_document',
      entityId: doc.id,
    });

    return {
      id: doc.id,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes ? doc.sizeBytes.toString() : null,
      downloadUrl: doc.storageKey,
    };
  }
}
