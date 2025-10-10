package com.ticketingSystem.calendar.dto;

import java.util.List;

public record CalendarConfigDto(
        String timezone,
        BusinessHoursDto defaultBusinessHours,
        List<BusinessHoursDto> exceptions
) {
}
