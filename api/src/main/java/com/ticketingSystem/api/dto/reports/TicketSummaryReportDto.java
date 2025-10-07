package com.ticketingSystem.api.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketSummaryReportDto {
    private long totalTickets;
    private long openTickets;
    private long closedTickets;
    private Map<String, Long> statusCounts;
    private Map<String, Long> modeCounts;
}
