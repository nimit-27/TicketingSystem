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
