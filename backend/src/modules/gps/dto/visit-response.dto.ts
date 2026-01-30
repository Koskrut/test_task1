import { VisitStatus } from '@prisma/client';

export class VisitResponseDto {
  id: string;
  managerId: string;
  clientId: string;
  status: VisitStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
}
