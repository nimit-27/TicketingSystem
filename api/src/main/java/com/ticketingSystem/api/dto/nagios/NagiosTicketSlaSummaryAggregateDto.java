package com.ticketingSystem.api.dto.nagios;

import java.time.LocalDateTime;

public record NagiosTicketSlaSummaryAggregateDto(long totalTickets,
                                                 long breachedTickets,
                                                 Double averageResolutionTimeMinutes,
                                                 Double averageResponseTimeMinutes,
                                                 Double averageBreachMinutes,
                                                 LocalDateTime minReportedDate,
                                                 LocalDateTime maxReportedDate) {
}
