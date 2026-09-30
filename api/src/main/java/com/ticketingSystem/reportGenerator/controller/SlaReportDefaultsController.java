package com.ticketingSystem.reportGenerator.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/sla-reports")
public class SlaReportDefaultsController {
    private final String defaultFromDate;

    public SlaReportDefaultsController(
            @Value("${report.sla.default-from-date}") String defaultFromDate) {
        this.defaultFromDate = defaultFromDate;
    }

    @GetMapping("/default-dates")
    public SlaReportDefaultDates getDefaultDates() {
        return new SlaReportDefaultDates(defaultFromDate, LocalDate.now().toString());
    }

    public record SlaReportDefaultDates(String fromDate, String toDate) {
    }
}
