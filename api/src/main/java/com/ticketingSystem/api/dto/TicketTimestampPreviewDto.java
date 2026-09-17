package com.ticketingSystem.api.dto;

import java.time.LocalDateTime;

public record TicketTimestampPreviewDto(
        LocalDateTime currentTimestamp,
        LocalDateTime calculatedTimestamp,
        LocalDateTime minimumTimestamp,
        LocalDateTime maximumTimestamp,
        Long minimumBusinessMinutes,
        Long maximumBusinessMinutes) {
}
