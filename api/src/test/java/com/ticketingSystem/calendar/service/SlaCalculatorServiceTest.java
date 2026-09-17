package com.ticketingSystem.calendar.service;

import com.ticketingSystem.calendar.repository.HolidayRepository;
import com.ticketingSystem.calendar.service.model.WorkingWindow;
import com.ticketingSystem.calendar.util.TimeUtils;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SlaCalculatorServiceTest {

    @Test
    void computeStartSubtractsAcrossClosedDaysUsingBusinessHours() {
        HolidayRepository holidayRepository = mock(HolidayRepository.class);
        BusinessHoursService businessHoursService = mock(BusinessHoursService.class);
        when(holidayRepository.findByDateAndRegion(any(LocalDate.class), anyString()))
                .thenReturn(Optional.empty());
        when(businessHoursService.resolveWindow(any(LocalDate.class))).thenAnswer(invocation -> {
            LocalDate date = invocation.getArgument(0);
            return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY
                    ? WorkingWindow.closedDay()
                    : new WorkingWindow(LocalTime.of(9, 0), LocalTime.of(17, 0), false);
        });
        SlaCalculatorService service = new SlaCalculatorService(holidayRepository, businessHoursService);

        var result = service.computeStart(
                LocalDateTime.of(2026, 9, 21, 10, 0).atZone(TimeUtils.ZONE_ID),
                Duration.ofMinutes(120));

        assertThat(result.toLocalDateTime()).isEqualTo(LocalDateTime.of(2026, 9, 18, 16, 0));
    }
}
