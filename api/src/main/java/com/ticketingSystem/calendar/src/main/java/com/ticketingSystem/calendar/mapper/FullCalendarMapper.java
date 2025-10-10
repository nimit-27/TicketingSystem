package com.ticketingSystem.calendar.mapper;

import com.ticketingSystem.calendar.dto.BusinessHoursDto;
import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import com.ticketingSystem.calendar.entity.CalendarEvent;
import com.ticketingSystem.calendar.entity.Holiday;
import com.ticketingSystem.calendar.service.model.WorkingWindow;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class FullCalendarMapper {

    public FullCalendarEventDto toHolidayEvent(Holiday holiday, ZoneId zoneId) {
        ZonedDateTime start = holiday.getDate().atStartOfDay(zoneId);
        ZonedDateTime end = start.plusDays(1);
        return new FullCalendarEventDto(
                holiday.getId() != null ? holiday.getId().toString() : null,
                holiday.getName(),
                TimeUtils.formatIso(start),
                TimeUtils.formatIso(end),
                Boolean.TRUE,
                "#f04444",
                "#ffffff"
        );
    }

    public FullCalendarEventDto toCalendarEvent(CalendarEvent event, ZoneId zoneId) {
        ZonedDateTime start = event.getStart().atZone(zoneId);
        ZonedDateTime end = event.getEnd().atZone(zoneId);
        return new FullCalendarEventDto(
                event.getId() != null ? event.getId().toString() : null,
                event.getTitle(),
                TimeUtils.formatIso(start),
                TimeUtils.formatIso(end),
                event.isAllDay(),
                event.getBackgroundColor(),
                event.getTextColor()
        );
    }

    public Map<String, Object> toFullCalendarBusinessHours(BusinessHoursDto dto) {
        int[] days = new int[dto.daysOfWeek().length];
        for (int i = 0; i < dto.daysOfWeek().length; i++) {
            days[i] = TimeUtils.mapIsoDayToFullCalendar(dto.daysOfWeek()[i]);
        }
        return Map.of(
                "daysOfWeek", days,
                "startTime", toClock(dto.startTimeMinutes()),
                "endTime", toClock(dto.endTimeMinutes())
        );
    }

    public BusinessHoursDto toBusinessHoursDto(WorkingWindow window, List<Integer> isoDays) {
        Integer[] days = isoDays.stream().map(Integer::valueOf).toArray(Integer[]::new);
        return new BusinessHoursDto(
                window.startTime() != null ? TimeUtils.toMinutes(window.startTime()) : null,
                window.endTime() != null ? TimeUtils.toMinutes(window.endTime()) : null,
                days
        );
    }

    public BusinessHoursDto toBusinessHoursDto(WorkingWindow window, LocalDate date) {
        return new BusinessHoursDto(
                window.startTime() != null ? TimeUtils.toMinutes(window.startTime()) : null,
                window.endTime() != null ? TimeUtils.toMinutes(window.endTime()) : null,
                new Integer[]{date.getDayOfWeek().getValue()}
        );
    }

    public List<Map<String, Object>> toFullCalendarBusinessHours(List<BusinessHoursDto> hours) {
        return hours.stream().map(this::toFullCalendarBusinessHours).collect(Collectors.toList());
    }

    private String toClock(Integer minutes) {
        if (minutes == null) {
            return null;
        }
        int hour = minutes / 60;
        int minute = minutes % 60;
        return String.format("%02d:%02d", hour, minute);
    }
}
