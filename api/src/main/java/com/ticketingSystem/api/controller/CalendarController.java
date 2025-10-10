package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.CalendarViewResponse;
import com.ticketingSystem.api.service.CalendarUiService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarUiService calendarUiService;

    public CalendarController(CalendarUiService calendarUiService) {
        this.calendarUiService = calendarUiService;
    }

    @GetMapping("/view")
    public CalendarViewResponse getCalendar(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return calendarUiService.loadCalendar(from, to);
    }
}
