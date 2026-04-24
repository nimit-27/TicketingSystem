package com.ticketingSystem.api.dto.nagios;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;

public record NagiosTicketSlaSummaryDto(String service,
                                        Instant generatedAt,
                                        LocalDateTime fromDate,
                                        LocalDateTime toDate,
                                        long totalTickets,
                                        long breachedTickets,
                                        long nonBreachedTickets,
                                        BigDecimal breachPercentage,
                                        BigDecimal compliancePercentage,
                                        BigDecimal averageResolutionTimeMinutes,
                                        BigDecimal averageResponseTimeMinutes,
                                        BigDecimal averageBreachMinutes,
                                        @JsonIgnore
                                        Map<String, Object> severitySummary,
                                        Map<String, Long> detailedBreakdown) {
    @JsonAnyGetter
    public Map<String, Object> flattenedSeveritySummary() {
        return severitySummary;
    }
}
