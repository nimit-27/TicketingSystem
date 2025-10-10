package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.CalendarUiProperties;
import com.ticketingSystem.calendar.facade.ExternalCalendarFacade;
import com.ticketingSystem.calendar.repository.HolidayRepository;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.LocalDate;
import java.time.Year;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class CalendarSyncService {

    private static final Logger log = LoggerFactory.getLogger(CalendarSyncService.class);

    private final HolidayRepository holidayRepository;
    private final ExternalCalendarFacade externalCalendarFacade;
    private final CalendarUiProperties properties;

    public CalendarSyncService(HolidayRepository holidayRepository,
                               ExternalCalendarFacade externalCalendarFacade,
                               CalendarUiProperties properties) {
        this.holidayRepository = holidayRepository;
        this.externalCalendarFacade = externalCalendarFacade;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public void ensureRange(LocalDate from, LocalDate to) {
        if (!properties.isEnsureOnDemand()) {
            return;
        }

        Year start = Year.of(from.getYear());
        Year end = Year.of(to.getYear());
        Year cursor = start;
        while (!cursor.isAfter(end)) {
            ensureYear(cursor);
            cursor = cursor.plusYears(1);
        }
    }

    @Transactional(readOnly = true)
    public void ensureYear(Year year) {
        LocalDate start = year.atDay(1);
        LocalDate end = year.atDay(year.length());
        String region = resolveRegion();
        boolean exists = holidayRepository.existsByDateBetweenAndRegion(start, end, region);
        if (!exists) {
            log.info("No holidays cached for year {} and region {}. Triggering sync from provider {}", year, region, resolveProvider());
            performSync(year);
        }
    }

    @Transactional
    public void syncYear(Year year) {
        performSync(year);
    }

    private void performSync(Year year) {
        String provider = resolveProvider();
        String region = resolveRegion();
        try {
            int imported = externalCalendarFacade.sync(provider, year, region);
            log.info("Synced {} holidays for year {} and region {} using provider {}", imported, year, region, provider);
        } catch (Exception ex) {
            log.warn("Failed to sync holidays for year {} and region {} using provider {}", year, region, provider, ex);
        }
    }

    private String resolveProvider() {
        String provider = properties.getProviderCode();
        if (!StringUtils.hasText(provider)) {
            return com.ticketingSystem.calendar.external.provider.NagerDateProvider.CODE;
        }
        return provider;
    }

    private String resolveRegion() {
        String region = properties.getRegion();
        if (!StringUtils.hasText(region)) {
            return TimeUtils.DEFAULT_REGION;
        }
        return region;
    }
}
