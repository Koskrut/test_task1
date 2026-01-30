import { VisitStatus } from '@prisma/client';
import { VisitEventResponseDto } from './visit-event-response.dto';

export class VisitDetailResponseDto {
  id: string;
  managerId: string;
  clientId: string;
  status: VisitStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  events: VisitEventResponseDto[];
}
