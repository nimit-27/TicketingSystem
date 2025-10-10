package com.ticketingSystem.calendar.controller;

import com.ticketingSystem.calendar.dto.CalendarConfigDto;
import com.ticketingSystem.calendar.dto.ComputeEndTimeRequest;
import com.ticketingSystem.calendar.dto.ComputeEndTimeResponse;
import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import com.ticketingSystem.calendar.service.CalendarQueryService;
import com.ticketingSystem.calendar.service.SlaCalculatorService;
import com.ticketingSystem.calendar.util.TimeUtils;
import jakarta.validation.Valid;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/calendar")
@Validated
public class CalendarQueryController {

    private final CalendarQueryService calendarQueryService;
    private final SlaCalculatorService slaCalculatorService;

    public CalendarQueryController(CalendarQueryService calendarQueryService,
                                   SlaCalculatorService slaCalculatorService) {
        this.calendarQueryService = calendarQueryService;
        this.slaCalculatorService = slaCalculatorService;
    }

    @GetMapping("/config")
    public CalendarConfigDto getConfig(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                       @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return calendarQueryService.getCalendarConfig(from, to);
    }

    @GetMapping("/events")
    public List<FullCalendarEventDto> listEvents(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                 @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return calendarQueryService.listEvents(from, to);
    }

    @PostMapping("/compute-end-time")
    public ComputeEndTimeResponse computeEndTime(@Valid @RequestBody ComputeEndTimeRequest request) {
        ZonedDateTime start = TimeUtils.parseIso(request.startDateTimeIso());
        ZonedDateTime end = slaCalculatorService.computeEnd(start, Duration.ofMinutes(request.durationMinutes()));
        return new ComputeEndTimeResponse(
                TimeUtils.formatIso(start),
                request.durationMinutes(),
                TimeUtils.formatIso(end)
        );
    }
}
