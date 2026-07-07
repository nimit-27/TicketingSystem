package com.ticketingSystem.api.dto.nagios;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;

public record NagiosTicketSlaSummaryDto(String service,
                                        Instant generatedAt,
                                        LocalDateTime fromDate,
                                        LocalDateTime toDate,
                                        @JsonProperty("totalTicketsRaisedTillNow")
                                        long totalTickets,
                                        long breachedTickets,
                                        long breachedTicketsInLast1Day,
                                        long breachedTicketsInLast3Days,
                                        long breachedTicketsInLast15Days,
                                        long breachedTicketsInLast30Days,
                                        long resolvedOrClosedBreachedTickets,
                                        long onHoldBreachedTickets,
                                        long pendingWithRequestorBreachedTickets,
                                        long pendingWithFciBreachedTickets,
                                        long pendingWithServiceProviderBreachedTickets,
                                        long openReopenedAssignedBreachedTickets,
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
