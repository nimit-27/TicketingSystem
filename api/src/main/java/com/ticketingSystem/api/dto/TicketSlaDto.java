package com.ticketingSystem.api.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for {@link com.ticketingSystem.api.models.TicketSla}.
 */
@Data
public class TicketSlaDto {
    private String id;
    private String ticketId;
    private String slaId;
    private LocalDateTime dueAt;
    private LocalDateTime actualDueAt;
    private LocalDateTime dueAtAfterEscalation;
    private Long resolutionTimeMinutes;
    private Long elapsedTimeMinutes;
    private Long responseTimeMinutes;
    private Long breachedByMinutes;
    private Long idleTimeMinutes;
    private LocalDateTime createdAt;
    private Long totalSlaMinutes;
    private Long timeTillDueDate;
    private Long workingTimeLeftMinutes;
}
