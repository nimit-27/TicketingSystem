package com.ticketingSystem.calendar.dto;

import com.ticketingSystem.calendar.entity.enums.WorkingHoursExceptionScope;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public record UpsertWorkingHoursExceptionRequest(
        Long id,
        @NotNull WorkingHoursExceptionScope scope,
        LocalDate targetDate,
        Integer weekday,
        LocalDate startDate,
        LocalDate endDate,
        String startTime,
        String endTime,
        @NotNull Boolean closed,
        @PositiveOrZero int priority,
        String note
) {
    public UpsertWorkingHoursExceptionRequest {
        if (scope == WorkingHoursExceptionScope.DATE && targetDate == null) {
            throw new IllegalArgumentException("targetDate is required for DATE scope");
        }
        if (scope == WorkingHoursExceptionScope.WEEKDAY && weekday == null) {
            throw new IllegalArgumentException("weekday is required for WEEKDAY scope");
        }
        if (scope == WorkingHoursExceptionScope.RANGE && (startDate == null || endDate == null)) {
            throw new IllegalArgumentException("startDate and endDate are required for RANGE scope");
        }
    }
}
