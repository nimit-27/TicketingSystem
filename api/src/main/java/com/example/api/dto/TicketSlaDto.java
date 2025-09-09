package com.example.api.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for {@link com.example.api.models.TicketSla}.
 */
@Data
public class TicketSlaDto {
    private String id;
    private String ticketId;
    private String slaId;
    private LocalDateTime dueAt;
    private Long resolutionTimeMinutes;
    private Long elapsedTimeMinutes;
    private Long responseTimeMinutes;
    private Long breachedByMinutes;
}
