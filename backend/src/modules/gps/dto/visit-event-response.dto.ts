export class VisitEventResponseDto {
  id: string;
  eventType: string;
  createdAt: Date;
  payload: Record<string, unknown>;
}
