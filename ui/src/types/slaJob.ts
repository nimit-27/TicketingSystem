export type SlaJobScope = "ACTIVE_ONLY" | "ALL_TICKETS" | "ALL_TICKETS_FROM_SCRATCH";
export type SlaJobTriggerType = "SCHEDULED" | "MANUAL";
export type SlaJobRunStatus = "RUNNING" | "COMPLETED" | "COMPLETED_WITH_ERRORS" | "FAILED";

export interface SlaCalculationJobRun {
  id: string;
  triggerType: SlaJobTriggerType;
  scope: SlaJobScope;
  runStatus: SlaJobRunStatus;
  triggeredBy?: string | null;
  startedAt: string;
  completedAt?: string | null;
  durationMs?: number | null;
  totalCandidateTickets?: number | null;
  processedTickets?: number | null;
  succeededTickets?: number | null;
  failedTickets?: number | null;
  batchSize?: number | null;
  errorSummary?: string | null;
}

export interface SlaCalculationJobOverview {
  running: boolean;
  runningJobId?: string | null;
  cronExpression: string;
  batchSize: number;
  nextScheduledAt?: string | null;
  minutesUntilNextRun?: number | null;
  triggerJobs?: TriggerJob[];
  history: SlaCalculationJobRun[];
}

export type TriggerPeriod = "MANUAL" | "PERIODIC" | "SCHEDULE";

export interface TriggerJob {
  triggerJobId: string;
  triggerJobCode: string;
  triggerJobName: string;
  batchSize: number;
  triggerPeriod: TriggerPeriod;
  cronExpression?: string | null;
  minutesUntilNextRun?: number | null;
  nextScheduledAt?: string | null;
  running: boolean;
}
