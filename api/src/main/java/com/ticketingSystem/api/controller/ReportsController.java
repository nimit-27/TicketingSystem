package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.reports.CustomerSatisfactionReportDto;
import com.ticketingSystem.api.dto.reports.ProblemManagementReportDto;
import com.ticketingSystem.api.dto.reports.TicketResolutionTimeReportDto;
import com.ticketingSystem.api.dto.reports.TicketSummaryReportDto;
import com.ticketingSystem.api.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ReportsController {
    private final ReportService reportService;

    @GetMapping("/ticket-summary")
    public ResponseEntity<TicketSummaryReportDto> getTicketSummaryReport() {
        return ResponseEntity.ok(reportService.getTicketSummaryReport());
    }

    @GetMapping("/resolution-time")
    public ResponseEntity<TicketResolutionTimeReportDto> getTicketResolutionTimeReport() {
        return ResponseEntity.ok(reportService.getTicketResolutionTimeReport());
    }

    @GetMapping("/customer-satisfaction")
    public ResponseEntity<CustomerSatisfactionReportDto> getCustomerSatisfactionReport() {
        return ResponseEntity.ok(reportService.getCustomerSatisfactionReport());
    }

    @GetMapping("/problem-management")
    public ResponseEntity<ProblemManagementReportDto> getProblemManagementReport() {
        return ResponseEntity.ok(reportService.getProblemManagementReport());
    }
}
