package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.CalendarViewResponse;
import com.ticketingSystem.calendar.dto.CalendarConfigDto;
import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import com.ticketingSystem.calendar.service.CalendarQueryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarUiServiceTest {

    @Mock
    private CalendarQueryService calendarQueryService;
    @Mock
    private CalendarSyncService calendarSyncService;

    @InjectMocks
    private CalendarUiService service;

    @Test
    void loadCalendarShouldSyncThenReturnConfigAndEvents() {
        LocalDate from = LocalDate.of(2025, 1, 1);
        LocalDate to = LocalDate.of(2025, 1, 31);
        CalendarConfigDto config = new CalendarConfigDto();
        List<FullCalendarEventDto> events = List.of(new FullCalendarEventDto());
        when(calendarQueryService.getCalendarConfig(from, to)).thenReturn(config);
        when(calendarQueryService.listEvents(from, to)).thenReturn(events);

        CalendarViewResponse response = service.loadCalendar(from, to);

        // We first ensure cache freshness, then execute the read queries.
        verify(calendarSyncService).ensureRange(from, to);
        verify(calendarQueryService).getCalendarConfig(from, to);
        verify(calendarQueryService).listEvents(from, to);
        assertThat(response.config()).isEqualTo(config);
        assertThat(response.events()).containsExactlyElementsOf(events);
    }
}
