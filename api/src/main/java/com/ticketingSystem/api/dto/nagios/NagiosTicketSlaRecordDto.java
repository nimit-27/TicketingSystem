package com.ticketingSystem.api.dto.nagios;

import java.time.LocalDateTime;

public record NagiosTicketSlaRecordDto(String ticketSlaId,
                                       String ticketId,
                                       String ticketNumber,
                                       String ticketStatus,
                                       Long breachedByMinutes,
                                       Long responseTimeMinutes,
                                       Long resolutionTimeMinutes,
                                       LocalDateTime dueAt,
                                       LocalDateTime actualDueAt,
                                       LocalDateTime dueAtAfterEscalation) {
}
