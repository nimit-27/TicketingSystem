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
