import { VisitStatus } from '../../../common/types/status';

export class VisitResponseDto {
  id!: string;
  managerId!: string;
  clientId!: string;
  status!: VisitStatus;
  startedAt!: Date | null;
  endedAt!: Date | null;
  createdAt!: Date;
}
