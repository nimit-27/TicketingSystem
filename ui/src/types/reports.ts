export interface TicketSummaryReport {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    statusCounts: Record<string, number>;
    modeCounts: Record<string, number>;
}

export interface TicketResolutionTimeReport {
    averageResolutionHours: number;
    resolvedTicketCount: number;
    averageResolutionHoursByStatus: Record<string, number>;
}

export interface CustomerSatisfactionReport {
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

export interface ProblemManagementReport {
    categoryStats: ProblemCategoryStat[];
}
