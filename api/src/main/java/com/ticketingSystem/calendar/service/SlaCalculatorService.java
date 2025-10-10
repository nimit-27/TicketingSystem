package com.ticketingSystem.calendar.service;

import com.ticketingSystem.calendar.repository.HolidayRepository;
import com.ticketingSystem.calendar.service.model.WorkingWindow;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SlaCalculatorService {

    private final HolidayRepository holidayRepository;
    private final BusinessHoursService businessHoursService;

    public SlaCalculatorService(HolidayRepository holidayRepository,
                                BusinessHoursService businessHoursService) {
        this.holidayRepository = holidayRepository;
        this.businessHoursService = businessHoursService;
    }

    public ZonedDateTime computeEnd(ZonedDateTime start, Duration duration) {
        ZonedDateTime cursor = start.withZoneSameInstant(TimeUtils.ZONE_ID);
        Duration remaining = duration;
        while (!remaining.isNegative()) {
            LocalDate date = cursor.toLocalDate();
            if (isHoliday(date)) {
                cursor = nextBusinessStart(date.plusDays(1));
                continue;
            }
            WorkingWindow window = businessHoursService.resolveWindow(date);
            if (!window.isOpen()) {
                cursor = nextBusinessStart(date.plusDays(1));
                continue;
            }
            ZonedDateTime windowStart = TimeUtils.atZone(date, window.startTime());
            ZonedDateTime windowEnd = TimeUtils.atZone(date, window.endTime());
            if (cursor.isBefore(windowStart)) {
                cursor = windowStart;
            }
            if (!cursor.isBefore(windowEnd)) {
                cursor = nextBusinessStart(date.plusDays(1));
                continue;
            }
            Duration available = Duration.between(cursor, windowEnd);
            if (available.compareTo(remaining) >= 0) {
                return cursor.plus(remaining);
            }
            cursor = nextBusinessStart(date.plusDays(1));
            remaining = remaining.minus(available);
        }
        return cursor;
    }

    private boolean isHoliday(LocalDate date) {
        return holidayRepository.findByDateAndRegion(date, TimeUtils.DEFAULT_REGION).isPresent();
    }

    private ZonedDateTime nextBusinessStart(LocalDate date) {
        LocalDate pointer = date;
        while (true) {
            if (isHoliday(pointer)) {
                pointer = pointer.plusDays(1);
                continue;
            }
            WorkingWindow window = businessHoursService.resolveWindow(pointer);
            if (!window.isOpen()) {
                pointer = pointer.plusDays(1);
                continue;
            }
            return TimeUtils.atZone(pointer, window.startTime());
        }
    }
}
