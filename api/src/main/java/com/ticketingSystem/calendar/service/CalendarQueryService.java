package com.ticketingSystem.calendar.service;

import com.ticketingSystem.calendar.dto.BusinessHoursDto;
import com.ticketingSystem.calendar.dto.CalendarConfigDto;
import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import com.ticketingSystem.calendar.entity.Holiday;
import com.ticketingSystem.calendar.mapper.FullCalendarMapper;
import com.ticketingSystem.calendar.repository.CalendarEventRepository;
import com.ticketingSystem.calendar.repository.HolidayRepository;
import com.ticketingSystem.calendar.service.model.WorkingWindow;
import com.ticketingSystem.calendar.util.TimeUtils;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CalendarQueryService {

    private final HolidayRepository holidayRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final BusinessHoursService businessHoursService;
    private final FullCalendarMapper fullCalendarMapper;
    private final ZoneId zoneId;

    public CalendarQueryService(HolidayRepository holidayRepository,
                                CalendarEventRepository calendarEventRepository,
                                BusinessHoursService businessHoursService,
                                FullCalendarMapper fullCalendarMapper,
                                ZoneId zoneId) {
        this.holidayRepository = holidayRepository;
        this.calendarEventRepository = calendarEventRepository;
        this.businessHoursService = businessHoursService;
        this.fullCalendarMapper = fullCalendarMapper;
        this.zoneId = zoneId;
    }

    public List<FullCalendarEventDto> listEvents(LocalDate from, LocalDate to) {
        List<FullCalendarEventDto> events = new ArrayList<>();
        List<Holiday> holidays = holidayRepository.findByDateBetweenAndRegion(from, to, TimeUtils.DEFAULT_REGION);
        events.addAll(holidays.stream()
                .map(holiday -> fullCalendarMapper.toHolidayEvent(holiday, zoneId))
                .toList());

        events.addAll(calendarEventRepository.findOverlapping(from.atStartOfDay(), to.plusDays(1).atStartOfDay())
                .stream()
                .map(event -> fullCalendarMapper.toCalendarEvent(event, zoneId))
                .toList());

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            WorkingWindow window = businessHoursService.resolveWindow(date);
            if (!window.isOpen()) {
                events.add(new FullCalendarEventDto(
                        "closure-" + date,
                        "Closed",
                        TimeUtils.formatIso(date.atStartOfDay(zoneId)),
                        TimeUtils.formatIso(date.plusDays(1).atStartOfDay(zoneId)),
                        Boolean.TRUE,
                        "#9ca3af",
                        "#111827"
                ));
            }
        }
        return events;
    }

    public CalendarConfigDto getCalendarConfig(LocalDate from, LocalDate to) {
        List<BusinessHoursDto> businessHours = businessHoursService.resolveBusinessHoursForRange(from, to);
        BusinessHoursDto defaultHours = businessHours.isEmpty() ? null : businessHours.get(0);
        List<BusinessHoursDto> exceptions = businessHours.stream().skip(1).collect(Collectors.toList());
        return new CalendarConfigDto(zoneId.getId(), defaultHours, exceptions);
    }
}
