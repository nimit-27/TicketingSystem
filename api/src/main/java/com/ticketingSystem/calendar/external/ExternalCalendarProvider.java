package com.ticketingSystem.calendar.external;

import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import com.ticketingSystem.calendar.entity.Holiday;
import java.time.Year;
import java.time.ZoneId;
import java.util.List;

public interface ExternalCalendarProvider {

    String providerCode();

    List<Holiday> fetchHolidays(Year year, String region);

    List<FullCalendarEventDto> toFullCalendarEvents(List<Holiday> holidays, ZoneId zoneId);

    List<Holiday> toDomain(Object raw);
}
