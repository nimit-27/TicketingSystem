package com.ticketingSystem.calendar.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ComputeEndTimeRequest(
        @NotBlank String startDateTimeIso,
        @Min(1) long durationMinutes,
        Integer modeId
) {
}
