package com.ticketingSystem.calendar.dto;

import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.List;

public record UpsertHolidaysRequest(
        @NotEmpty List<LocalDate> dates,
        String region,
        String name,
        Boolean optional
) {
}
