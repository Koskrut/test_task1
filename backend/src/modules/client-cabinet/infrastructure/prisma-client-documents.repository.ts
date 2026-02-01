import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  ClientDocumentRecord,
  ClientDocumentsRepository,
} from '../repositories/client-documents.repository';

@Injectable()
export class PrismaClientDocumentsRepository implements ClientDocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByClient(
    clientId: string,
    filter: { type?: string | null },
    pagination: { skip: number; take: number },
  ): Promise<{ items: ClientDocumentRecord[]; total: number }> {
    const where = {
      clientId,
      ...(filter.type ? { documentType: filter.type } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.clientDocument.findMany({
        where,
        include: { attachment: true },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.clientDocument.count({ where }),
    ]);

    return {
      items: items.map((doc) => ({
        id: doc.id,
        title: doc.title,
        documentType: doc.documentType,
        createdAt: doc.createdAt,
        fileName: doc.attachment.fileName,
        mimeType: doc.attachment.mimeType,
        sizeBytes: doc.attachment.sizeBytes,
        storageKey: doc.attachment.storageKey,
      })),
      total,
    };
  }

  async findById(
    clientId: string,
    documentId: string,
  ): Promise<ClientDocumentRecord | null> {
    const doc = await this.prisma.clientDocument.findFirst({
      where: { id: documentId, clientId },
      include: { attachment: true },
    });
    if (!doc) {
      return null;
    }
    return {
      id: doc.id,
      title: doc.title,
      documentType: doc.documentType,
      createdAt: doc.createdAt,
      fileName: doc.attachment.fileName,
      mimeType: doc.attachment.mimeType,
      sizeBytes: doc.attachment.sizeBytes,
      storageKey: doc.attachment.storageKey,
    };
  }
}
