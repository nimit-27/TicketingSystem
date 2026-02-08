package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.reports.CustomerSatisfactionReportDto;
import com.ticketingSystem.api.dto.reports.ProblemManagementReportDto;
import com.ticketingSystem.api.dto.reports.SlaPerformanceReportDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardSummaryDto;
import com.ticketingSystem.api.dto.reports.TicketResolutionTimeReportDto;
import com.ticketingSystem.api.dto.reports.TicketSummaryReportDto;
import com.ticketingSystem.api.service.ReportService;
import com.ticketingSystem.api.service.TicketAuthorizationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ReportsController {
    private final ReportService reportService;
    private final TicketAuthorizationService ticketAuthorizationService;

    @GetMapping("/support-dashboard-summary")
    public ResponseEntity<SupportDashboardSummaryDto> getSupportDashboardSummary(
            @RequestHeader(value = "X-USER-ID", required = false) String userId,
            @RequestParam(value = "timeScale", required = false) String timeScale,
            @RequestParam(value = "timeRange", required = false) String timeRange,
            @RequestParam(value = "customStartYear", required = false) Integer customStartYear,
            @RequestParam(value = "customEndYear", required = false) Integer customEndYear,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate) {
        return ResponseEntity.ok(reportService.getSupportDashboardSummary(
                userId,
                timeScale,
                timeRange,
                customStartYear,
                customEndYear,
                fromDate,
                toDate
        ));
    }

    @GetMapping("/support-dashboard-summary/filtered")
    public ResponseEntity<SupportDashboardSummaryDto> getFilteredSupportDashboardSummary(
            @AuthenticationPrincipal LoginPayload authenticatedUser,
            HttpSession session,
            @RequestHeader(value = "X-USER-ID", required = false) String xUserId,
            @RequestParam MultiValueMap<String, String> allParams,
            @RequestParam(value = "timeScale", required = false) String timeScale,
            @RequestParam(value = "timeRange", required = false) String timeRange,
            @RequestParam(value = "customStartYear", required = false) Integer customStartYear,
            @RequestParam(value = "customEndYear", required = false) Integer customEndYear,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "issueTypeId", required = false) String issueTypeId,
            @RequestParam(value = "parameterKey", required = false) String parameterKey,
            @RequestParam(value = "parameterValue", required = false) String parameterValue) {
        String userId = ticketAuthorizationService.resolveUserId(authenticatedUser, session);
        if(userId == null || userId.isBlank()) userId = xUserId;

        return ResponseEntity.ok(reportService.getSupportDashboardSummaryFiltered(
                userId,
                timeScale,
                timeRange,
                customStartYear,
                customEndYear,
                fromDate,
                toDate,
                parameterKey,
                parameterValue,
                issueTypeId,
                allParams
        ));
    }

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

    @GetMapping("/sla-performance")
    public ResponseEntity<SlaPerformanceReportDto> getSlaPerformanceReport() {
        return ResponseEntity.ok(reportService.getSlaPerformanceReport());
    }

    @PostMapping("/sla-performance/notify-breaches")
    public ResponseEntity<Void> notifyBreachedAssignees() {
        reportService.notifyBreachedSlaAssignees();
        return ResponseEntity.accepted().build();
    }
}
