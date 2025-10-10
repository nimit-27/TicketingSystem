package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.CalendarViewResponse;
import com.ticketingSystem.calendar.dto.CalendarConfigDto;
import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import com.ticketingSystem.calendar.service.CalendarQueryService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CalendarUiService {

    private final CalendarQueryService calendarQueryService;
    private final CalendarSyncService calendarSyncService;

    public CalendarUiService(CalendarQueryService calendarQueryService,
                             CalendarSyncService calendarSyncService) {
        this.calendarQueryService = calendarQueryService;
        this.calendarSyncService = calendarSyncService;
    }

    @Transactional(readOnly = true)
    public CalendarViewResponse loadCalendar(LocalDate from, LocalDate to) {
        calendarSyncService.ensureRange(from, to);
        CalendarConfigDto config = calendarQueryService.getCalendarConfig(from, to);
        List<FullCalendarEventDto> events = calendarQueryService.listEvents(from, to);
        return new CalendarViewResponse(config, events);
    }
}
