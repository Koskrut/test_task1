import { VisitStatus } from '../../../common/types/status';

export interface VisitEntity {
  id: string;
  managerId: string;
  clientId: string;
  status: VisitStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
}

export interface CreateVisitInput {
  managerId: string;
  clientId: string;
  startedAt: Date;
  status: VisitStatus;
}

export interface FinishVisitInput {
  endedAt: Date;
  status: VisitStatus;
}

export interface VisitsRepository {
  create(data: CreateVisitInput): Promise<VisitEntity>;
  findActiveForManagerClient(
    managerId: string,
    clientId: string,
  ): Promise<VisitEntity | null>;
  findById(id: string): Promise<VisitEntity | null>;
  listByManager(managerId: string): Promise<VisitEntity[]>;
  finish(id: string, data: FinishVisitInput): Promise<VisitEntity>;
}
