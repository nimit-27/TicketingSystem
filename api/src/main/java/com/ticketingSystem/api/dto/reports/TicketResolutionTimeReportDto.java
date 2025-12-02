package com.ticketingSystem.api.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResolutionTimeReportDto {
    private double averageResolutionHours;
    private long resolvedTicketCount;
    private Map<String, Double> averageResolutionHoursByStatus;
    private List<ResolutionCategoryStatDto> categoryStats;
}
