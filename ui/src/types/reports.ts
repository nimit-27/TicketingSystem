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
    categoryStats?: ResolutionCategoryStat[];
    categoryPriorityStats?: ResolutionCategoryPriorityStat[];
}

export interface ResolutionCategoryPriorityStat {
    category: string;
    subcategory: string;
    priority: string;
    averageResolutionHours: number;
    resolvedTicketCount: number;
}

export interface ResolutionCategoryStat {
    category: string;
    subcategory: string;
    resolvedTickets: number;
    closedTickets: number;
    averageResolutionHours: number;
}

export interface CustomerSatisfactionReportProps {
    totalResponses: number;
    overallSatisfactionAverage: number;
    resolutionEffectivenessAverage: number;
    communicationSupportAverage: number;
    timelinessAverage: number;
    compositeScore: number;
    priorityBreakdown?: CustomerSatisfactionPriorityStat[];
}

export interface CustomerSatisfactionPriorityStat {
    category: string;
    subcategory: string;
    priority: string;
    ratingCounts: Record<string, number>;
    ticketCount?: number;
    breachedTickets?: number;
    totalResponses: number;
}

export interface ProblemCategoryStat {
    category: string;
    subcategory?: string;
    ticketCount: number;
    breachedTickets?: number;
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

export interface MISReportRequestParams {
    fromDate?: string;
    toDate?: string;
    scope?: "all" | "user";
    userId?: string;
}

export type SupportDashboardSeverityKey = "S1" | "S2" | "S3" | "S4";
// export type SupportDashboardSeverityKey = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type SupportDashboardScopeKey = "allTickets" | "myWorkload";

export interface SupportDashboardSummaryView {
    pendingForAcknowledgement: number;
    severityCounts: Record<SupportDashboardSeverityKey, number>;
    totalTickets: number;
}

export type SupportDashboardSummary = Partial<Record<SupportDashboardScopeKey, SupportDashboardSummaryView | null>>;

export interface SupportDashboardOpenResolvedStats {
    openTickets: number;
    resolvedTickets: number;
}

export interface SupportDashboardSlaCompliancePoint {
    label: string;
    withinSla: number;
    overdue: number;
}

export interface SupportDashboardTicketVolumePoint {
    label: string;
    tickets: number;
}

export interface SupportDashboardSummaryResponse {
    allTickets?: SupportDashboardSummarySectionDto | null;
    myWorkload?: SupportDashboardSummarySectionDto | null;
    openResolved?: SupportDashboardOpenResolvedStats | null;
    slaCompliance?: SupportDashboardSlaCompliancePoint[];
    ticketVolume?: SupportDashboardTicketVolumePoint[];
}

export interface SupportDashboardSummarySectionDto {
    pendingForAcknowledgement: number;
    severityCounts: Record<string, number>;
    totalTickets: number;
}

export type SupportDashboardTimeScale = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";

export type SupportDashboardTimeRange =
    | "LAST_DAY"
    | "LAST_7_DAYS"
    | "LAST_30_DAYS"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "LAST_4_WEEKS"
    | "LAST_6_MONTHS"
    | "CURRENT_YEAR"
    | "YEAR_TO_DATE"
    | "LAST_YEAR"
    | "LAST_5_YEARS"
    | "CUSTOM_MONTH_RANGE"
    | "ALL_TIME"
    | "CUSTOM_DATE_RANGE";

export interface SupportDashboardSummaryRequestParams {
    timeScale?: SupportDashboardTimeScale;
    timeRange?: SupportDashboardTimeRange;
    customStartYear?: number;
    customEndYear?: number;
    fromDate?: string;
    toDate?: string;
}
