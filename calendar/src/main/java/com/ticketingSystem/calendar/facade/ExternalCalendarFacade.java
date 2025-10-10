package com.ticketingSystem.calendar.facade;

import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import com.ticketingSystem.calendar.entity.Holiday;
import com.ticketingSystem.calendar.external.ExternalCalendarProvider;
import com.ticketingSystem.calendar.exception.CalendarException;
import com.ticketingSystem.calendar.service.HolidayAdminService;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.Year;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ExternalCalendarFacade {

    private final Map<String, ExternalCalendarProvider> providersByCode;
    private final HolidayAdminService holidayAdminService;
    private final ZoneId zoneId;

    public ExternalCalendarFacade(List<ExternalCalendarProvider> providers,
                                  HolidayAdminService holidayAdminService,
                                  ZoneId zoneId) {
        this.providersByCode = providers.stream()
                .collect(Collectors.toUnmodifiableMap(ExternalCalendarProvider::providerCode, provider -> provider));
        this.holidayAdminService = holidayAdminService;
        this.zoneId = zoneId;
    }

    public List<FullCalendarEventDto> fetchAndMap(String providerCode, Year year, String region) {
        ExternalCalendarProvider provider = requireProvider(providerCode);
        String effectiveRegion = region != null ? region : TimeUtils.DEFAULT_REGION;
        List<Holiday> holidays = provider.fetchHolidays(year, effectiveRegion);
        return provider.toFullCalendarEvents(holidays, zoneId);
    }

    public int sync(String providerCode, Year year, String region) {
        ExternalCalendarProvider provider = requireProvider(providerCode);
        String effectiveRegion = region != null ? region : TimeUtils.DEFAULT_REGION;
        List<Holiday> holidays = provider.fetchHolidays(year, effectiveRegion);
        holidays.forEach(holidayAdminService::upsertHoliday);
        return holidays.size();
    }

    private ExternalCalendarProvider requireProvider(String providerCode) {
        ExternalCalendarProvider provider = providersByCode.get(providerCode);
        if (provider == null) {
            throw new CalendarException("Unknown provider: " + providerCode);
        }
        return provider;
    }
}
