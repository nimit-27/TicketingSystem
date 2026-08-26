package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.CalendarUiProperties;
import com.ticketingSystem.calendar.facade.ExternalCalendarFacade;
import com.ticketingSystem.calendar.repository.HolidayRepository;
import com.ticketingSystem.calendar.util.TimeUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.Year;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarSyncServiceTest {

    @Mock
    private HolidayRepository holidayRepository;
    @Mock
    private ExternalCalendarFacade externalCalendarFacade;

    private CalendarUiProperties properties;

    @InjectMocks
    private CalendarSyncService service;

    @BeforeEach
    void setUp() {
        properties = new CalendarUiProperties();
        properties.setEnsureOnDemand(true);
        properties.setProviderCode("nager");
        properties.setRegion("IN-WB");
        service = new CalendarSyncService(holidayRepository, externalCalendarFacade, properties);
    }

    @Test
    void ensureRangeShouldDoNothingWhenOnDemandSyncDisabled() {
        properties.setEnsureOnDemand(false);

        service.ensureRange(LocalDate.of(2024, 1, 1), LocalDate.of(2026, 12, 31));

        verifyNoHolidayLookupOrSync();
    }

    @Test
    void ensureRangeShouldTraverseAllYearsInWindow() {
        when(holidayRepository.existsByDateBetweenAndRegion(any(LocalDate.class), any(LocalDate.class), eq("IN-WB"))).thenReturn(true);

        service.ensureRange(LocalDate.of(2024, 12, 20), LocalDate.of(2026, 1, 10));

        verify(holidayRepository).existsByDateBetweenAndRegion(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31), "IN-WB");
        verify(holidayRepository).existsByDateBetweenAndRegion(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31), "IN-WB");
        verify(holidayRepository).existsByDateBetweenAndRegion(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31), "IN-WB");
        verify(externalCalendarFacade, never()).sync(any(), any(), any());
    }

    @Test
    void ensureYearShouldTriggerSyncWhenNoCacheExists() {
        when(holidayRepository.existsByDateBetweenAndRegion(any(), any(), eq("IN-WB"))).thenReturn(false);

        service.ensureYear(Year.of(2025));

        verify(externalCalendarFacade).sync("nager", Year.of(2025), "IN-WB");
    }

    @Test
    void ensureYearShouldUseDefaultProviderAndRegionWhenBlank() {
        properties.setProviderCode(" ");
        properties.setRegion(null);
        when(holidayRepository.existsByDateBetweenAndRegion(any(LocalDate.class), any(LocalDate.class), anyString())).thenReturn(false);

        service.ensureYear(Year.of(2024));

        verify(externalCalendarFacade).sync("NAGER_DATE", Year.of(2024), TimeUtils.DEFAULT_REGION);
    }

    @Test
    void syncYearShouldSwallowProviderFailures() {
        when(externalCalendarFacade.sync(any(), any(), any())).thenThrow(new RuntimeException("upstream unavailable"));

        service.syncYear(Year.of(2027));

        // Method should not propagate provider failures because sync is best-effort.
        verify(externalCalendarFacade).sync("nager", Year.of(2027), "IN-WB");
    }

    private void verifyNoHolidayLookupOrSync() {
        verify(holidayRepository, never()).existsByDateBetweenAndRegion(any(), any(), any());
        verify(externalCalendarFacade, never()).sync(any(), any(), any());
    }
}
