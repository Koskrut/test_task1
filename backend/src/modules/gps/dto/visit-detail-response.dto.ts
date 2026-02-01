import { VisitStatus } from '../../../common/types/status';
import { VisitEventResponseDto } from './visit-event-response.dto';

export class VisitDetailResponseDto {
  id!: string;
  managerId!: string;
  clientId!: string;
  status!: VisitStatus;
  startedAt!: Date | null;
  endedAt!: Date | null;
  createdAt!: Date;
  events!: VisitEventResponseDto[];
}
