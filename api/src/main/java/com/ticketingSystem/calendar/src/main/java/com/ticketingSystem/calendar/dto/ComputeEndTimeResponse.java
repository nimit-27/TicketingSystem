package com.ticketingSystem.calendar.dto;

public record ComputeEndTimeResponse(
        String startDateTimeIso,
        long durationMinutes,
        String endDateTimeIso
) {
}
