export interface TicketSummaryReportProps {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    statusCounts: Record<string, number>;
    modeCounts: Record<string, number>;
}

export interface TicketResolutionTimeReportProps {
    averageResolutionHours: number;
    resolvedTicketCount: number;
    averageResolutionHoursByStatus: Record<string, number>;
}

export interface CustomerSatisfactionReportProps {
    totalResponses: number;
    overallSatisfactionAverage: number;
    resolutionEffectivenessAverage: number;
    communicationSupportAverage: number;
    timelinessAverage: number;
    compositeScore: number;
}

export interface ProblemCategoryStat {
    category: string;
    ticketCount: number;
}

export interface ProblemManagementReportProps {
    categoryStats: ProblemCategoryStat[];
}

export interface SlaPerformanceStatusBreakdown {
    key: string;
    label: string;
    count: number;
}

export interface SlaSeverityBreakdown {
    severity: string;
    total: number;
    breached: number;
    onTrack: number;
    resolvedWithinSla: number;
    resolvedAfterBreach: number;
}

export interface SlaTrendPoint {
    date: string;
    dueCount: number;
    breachedCount: number;
    resolvedCount: number;
}

export interface SlaBreachedTicketSummary {
    ticketId: string | null;
    ticketNumber: string | null;
    subject: string | null;
    assignee: string | null;
    severity: string | null;
    status: string | null;
    dueAt: string | null;
    breachedByMinutes: number | null;
}

export interface SlaPerformanceReportProps {
    totalTicketsWithSla: number;
    totalBreachedTickets: number;
    totalOnTrackTickets: number;
    totalResolvedWithinSla: number;
    totalResolvedAfterBreach: number;
    totalInProgressTickets: number;
    inProgressBreachedTickets: number;
    inProgressOnTrackTickets: number;
    breachRate: number;
    averageBreachMinutes: number;
    statusBreakdown: SlaPerformanceStatusBreakdown[];
    severityBreakdown: SlaSeverityBreakdown[];
    breachTrend: SlaTrendPoint[];
    breachedTickets: SlaBreachedTicketSummary[];
}

export type SupportDashboardSeverityKey = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type SupportDashboardScopeKey = "allTickets" | "myWorkload";

export interface SupportDashboardSummaryView {
    pendingForAcknowledgement: number;
    severityCounts: Record<SupportDashboardSeverityKey, number>;
}

export type SupportDashboardSummary = Partial<Record<SupportDashboardScopeKey, SupportDashboardSummaryView | null>>;

export type SupportDashboardTimeScale = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type SupportDashboardTimeRange =
    | "LAST_DAY"
    | "LAST_7_DAYS"
    | "LAST_30_DAYS"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "LAST_4_WEEKS"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "LAST_12_MONTHS"
    | "YEAR_TO_DATE"
    | "LAST_YEAR";

export interface SupportDashboardSummaryRequestParams {
    timeScale?: SupportDashboardTimeScale;
    timeRange?: SupportDashboardTimeRange;
}
