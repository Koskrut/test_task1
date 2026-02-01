export interface ClientDocumentRecord {
  id: string;
  title: string;
  documentType: string | null;
  createdAt: Date;
  fileName: string;
  mimeType: string | null;
  sizeBytes: bigint | null;
  storageKey: string;
}

export interface ClientDocumentsRepository {
  listByClient(
    clientId: string,
    filter: { type?: string | null },
    pagination: { skip: number; take: number },
  ): Promise<{ items: ClientDocumentRecord[]; total: number }>;
  findById(
    clientId: string,
    documentId: string,
  ): Promise<ClientDocumentRecord | null>;
}
