export const VISIT_EVENT_TYPE = {
  Enter: 'enter',
  Exit: 'exit',
  VisitStarted: 'visit_started',
  VisitEnded: 'visit_ended',
  ManualStarted: 'manual_started',
  ManualEnded: 'manual_ended',
} as const;

export type VisitEventType =
  (typeof VISIT_EVENT_TYPE)[keyof typeof VISIT_EVENT_TYPE];
