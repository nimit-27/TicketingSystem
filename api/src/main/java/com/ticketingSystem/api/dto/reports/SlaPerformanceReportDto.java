package com.ticketingSystem.api.dto.reports;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlaPerformanceReportDto {
    private long totalTicketsWithSla;
    private long totalBreachedTickets;
    private long totalOnTrackTickets;
    private long totalResolvedWithinSla;
    private long totalResolvedAfterBreach;
    private long totalInProgressTickets;
    private long inProgressBreachedTickets;
    private long inProgressOnTrackTickets;
    private double breachRate;
    private Double averageBreachMinutes;
    private List<SlaStatusBreakdownDto> statusBreakdown;
    private List<SlaSeverityBreakdownDto> severityBreakdown;
    private List<SlaTrendPointDto> breachTrend;
    private List<SlaBreachedTicketSummaryDto> breachedTickets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlaStatusBreakdownDto {
        private String key;
        private String label;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlaSeverityBreakdownDto {
        private String severity;
        private long total;
        private long breached;
        private long onTrack;
        private long resolvedWithinSla;
        private long resolvedAfterBreach;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlaTrendPointDto {
        private LocalDate date;
        private long dueCount;
        private long breachedCount;
        private long resolvedCount;
    }

    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    public static class SlaBreachedTicketSummaryDto {
        private String ticketId;
        private String ticketNumber;
        private String subject;
        private String assignee;
        private String severity;
        private String status;
        private LocalDateTime dueAt;
        private Long breachedByMinutes;
    }
}
