package com.ticketingSystem.calendar.dto;

import jakarta.validation.constraints.NotBlank;

public record UpsertWorkingHoursRequest(
        @NotBlank String startTime,
        @NotBlank String endTime,
        String timezone
) {
}
