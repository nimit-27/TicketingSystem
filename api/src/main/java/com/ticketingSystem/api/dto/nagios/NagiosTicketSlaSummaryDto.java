package com.ticketingSystem.api.dto.nagios;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

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
                                        BigDecimal averageBreachMinutes) {
}
