package com.ticketingSystem.api.dto;

import com.ticketingSystem.calendar.dto.CalendarConfigDto;
import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import java.util.List;

public record CalendarViewResponse(
        CalendarConfigDto config,
        List<FullCalendarEventDto> events
) {
}
