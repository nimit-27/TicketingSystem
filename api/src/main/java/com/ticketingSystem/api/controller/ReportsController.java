package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.DownloadReportRequestDto;
import com.ticketingSystem.api.dto.DownloadReportResponseDto;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.PaginationResponse;
import com.ticketingSystem.api.dto.reports.CustomerSatisfactionReportDto;
import com.ticketingSystem.api.dto.sla.SlaCalculationJobOverviewDto;
import com.ticketingSystem.api.dto.sla.SlaCalculationJobRunDto;
import com.ticketingSystem.api.dto.sla.TriggerJobDto;
import com.ticketingSystem.api.dto.sla.UpdateTriggerPeriodRequestDto;
import com.ticketingSystem.api.dto.reports.ProblemManagementReportDto;
import com.ticketingSystem.api.dto.reports.SlaPerformanceReportDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardSummaryDto;
import com.ticketingSystem.api.dto.reports.TicketResolutionTimeReportDto;
import com.ticketingSystem.api.dto.reports.TicketSummaryReportDto;
import com.ticketingSystem.api.models.PolicyRule;
import com.ticketingSystem.api.service.PolicyEvaluationService;
import com.ticketingSystem.api.service.ReportService;
import com.ticketingSystem.api.service.SlaCalculationJobService;
import com.ticketingSystem.api.service.TicketAuthorizationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ReportsController {
    private final ReportService reportService;
    private final TicketAuthorizationService ticketAuthorizationService;
    private final SlaCalculationJobService slaCalculationJobService;
    private final PolicyEvaluationService policyEvaluationService;

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
    public ResponseEntity<TicketSummaryReportDto> getTicketSummaryReport(
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "subCategoryId", required = false) String subCategoryId,
            @RequestParam(value = "zoneCode", required = false) String zoneCode,
            @RequestParam(value = "regionCode", required = false) String regionCode,
            @RequestParam(value = "districtCode", required = false) String districtCode,
            @RequestParam(value = "issueTypeId", required = false) String issueTypeId,
            @RequestParam(value = "divisionId", required = false) String divisionId,
            @RequestParam(value = "assignedTo", required = false) String assignedTo) {
        return ResponseEntity.ok(reportService.getTicketSummaryReport(fromDate, toDate, categoryId, subCategoryId, zoneCode, regionCode, districtCode, issueTypeId, divisionId, assignedTo));
    }

    @GetMapping("/resolution-time")
    public ResponseEntity<TicketResolutionTimeReportDto> getTicketResolutionTimeReport(
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "subCategoryId", required = false) String subCategoryId,
            @RequestParam(value = "zoneCode", required = false) String zoneCode,
            @RequestParam(value = "regionCode", required = false) String regionCode,
            @RequestParam(value = "districtCode", required = false) String districtCode,
            @RequestParam(value = "issueTypeId", required = false) String issueTypeId,
            @RequestParam(value = "divisionId", required = false) String divisionId,
            @RequestParam(value = "assignedTo", required = false) String assignedTo) {
        return ResponseEntity.ok(reportService.getTicketResolutionTimeReport(fromDate, toDate, categoryId, subCategoryId, zoneCode, regionCode, districtCode, issueTypeId, divisionId, assignedTo));
    }

    @GetMapping("/customer-satisfaction")
    public ResponseEntity<CustomerSatisfactionReportDto> getCustomerSatisfactionReport(
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "subCategoryId", required = false) String subCategoryId,
            @RequestParam(value = "zoneCode", required = false) String zoneCode,
            @RequestParam(value = "regionCode", required = false) String regionCode,
            @RequestParam(value = "districtCode", required = false) String districtCode,
            @RequestParam(value = "issueTypeId", required = false) String issueTypeId,
            @RequestParam(value = "divisionId", required = false) String divisionId,
            @RequestParam(value = "assignedTo", required = false) String assignedTo) {
        return ResponseEntity.ok(reportService.getCustomerSatisfactionReport(fromDate, toDate, categoryId, subCategoryId, zoneCode, regionCode, districtCode, issueTypeId, divisionId, assignedTo));
    }

    @GetMapping("/problem-management")
    public ResponseEntity<ProblemManagementReportDto> getProblemManagementReport(
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "subCategoryId", required = false) String subCategoryId,
            @RequestParam(value = "zoneCode", required = false) String zoneCode,
            @RequestParam(value = "regionCode", required = false) String regionCode,
            @RequestParam(value = "districtCode", required = false) String districtCode,
            @RequestParam(value = "issueTypeId", required = false) String issueTypeId,
            @RequestParam(value = "divisionId", required = false) String divisionId,
            @RequestParam(value = "assignedTo", required = false) String assignedTo) {
        return ResponseEntity.ok(reportService.getProblemManagementReport(fromDate, toDate, categoryId, subCategoryId, zoneCode, regionCode, districtCode, issueTypeId, divisionId, assignedTo));
    }

    @GetMapping("/sla-performance")
    public ResponseEntity<SlaPerformanceReportDto> getSlaPerformanceReport(
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "scope", required = false) String scope,
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "subCategoryId", required = false) String subCategoryId,
            @RequestParam(value = "zoneCode", required = false) String zoneCode,
            @RequestParam(value = "regionCode", required = false) String regionCode,
            @RequestParam(value = "districtCode", required = false) String districtCode,
            @RequestParam(value = "issueTypeId", required = false) String issueTypeId,
            @RequestParam(value = "division", required = false) String division,
            @RequestParam(value = "assignedTo", required = false) String assignedTo,
            @RequestParam(value = "breachedFilter", required = false) String breachedFilter) {
        return ResponseEntity.ok(reportService.getSlaPerformanceReport(
                fromDate,
                toDate,
                scope,
                userId,
                categoryId,
                subCategoryId,
                zoneCode,
                regionCode,
                districtCode,
                issueTypeId,
                division,
                assignedTo,
                breachedFilter
        ));
    }

    @PostMapping("/sla-performance/notify-breaches")
    public ResponseEntity<Void> notifyBreachedAssignees() {
        reportService.notifyBreachedSlaAssignees();
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/sla-calculation/history")
    public ResponseEntity<SlaCalculationJobOverviewDto> getSlaCalculationHistory(
            @RequestParam(value = "limit", required = false, defaultValue = "20") int limit) {
        return ResponseEntity.ok(slaCalculationJobService.getOverview(limit));
    }

    @PostMapping("/sla-calculation/trigger-all")
    public ResponseEntity<SlaCalculationJobRunDto> triggerSlaCalculationForAllTickets(
            @AuthenticationPrincipal LoginPayload authenticatedUser,
            @RequestHeader(value = "X-USER-ID", required = false) String userIdHeader) {
        return ResponseEntity.accepted().body(slaCalculationJobService.triggerManualAllTickets(resolveTriggeredBy(authenticatedUser, userIdHeader)));
    }

    @PostMapping("/sla-calculation/trigger-all-from-scratch")
    public ResponseEntity<SlaCalculationJobRunDto> triggerSlaCalculationForAllTicketsFromScratch(
            @AuthenticationPrincipal LoginPayload authenticatedUser,
            @RequestHeader(value = "X-USER-ID", required = false) String userIdHeader) {
        return ResponseEntity.accepted().body(slaCalculationJobService.triggerManualAllTicketsFromScratch(resolveTriggeredBy(authenticatedUser, userIdHeader)));
    }

    @PostMapping("/sla-calculation/trigger")
    public ResponseEntity<SlaCalculationJobRunDto> triggerSlaCalculationJob(
            @AuthenticationPrincipal LoginPayload authenticatedUser,
            @RequestParam(value = "jobCode", required = false, defaultValue = "sla_job") String jobCode,
            @RequestHeader(value = "X-USER-ID", required = false) String userIdHeader) {
        return ResponseEntity.accepted().body(slaCalculationJobService.triggerManualByJobCode(jobCode, resolveTriggeredBy(authenticatedUser, userIdHeader)));
    }

    @GetMapping("/sla-calculation/trigger-jobs")
    public ResponseEntity<List<TriggerJobDto>> getTriggerJobs() {
        return ResponseEntity.ok(slaCalculationJobService.getTriggerJobs());
    }

    @PutMapping("/sla-calculation/trigger-jobs/{jobCode}/period")
    public ResponseEntity<TriggerJobDto> updateTriggerJobPeriod(
            @PathVariable("jobCode") String jobCode,
            @RequestBody UpdateTriggerPeriodRequestDto request) {
        return ResponseEntity.ok(slaCalculationJobService.updateTriggerPeriod(jobCode, request));
    }

    private String resolveTriggeredBy(LoginPayload authenticatedUser, String userIdHeader) {
        if (authenticatedUser != null && authenticatedUser.getUserId() != null && !authenticatedUser.getUserId().isBlank()) {
            return authenticatedUser.getUserId();
        }

        if (userIdHeader != null && !userIdHeader.isBlank()) {
            return userIdHeader;
        }

        return "SYSTEM";
    }

    @GetMapping("/downloads")
    public ResponseEntity<PaginationResponse<DownloadReportResponseDto>> getReportRequests(
            @AuthenticationPrincipal LoginPayload authenticatedUser,

            DownloadReportRequestDto requestDto,
            @RequestParam Map<String, String>allParams
    ) {
        List<PolicyRule> policyRules = policyEvaluationService.resolveScopedParams(authenticatedUser, allParams);
        Set<String> policyRulesParams = policyRules.stream().map(PolicyRule::getConditionKey).collect(Collectors.toSet());
        requestDto.applyPolicyRuleParams(policyRulesParams, authenticatedUser);

        Pageable pageable = PageRequest.of(requestDto.getPage(), requestDto.getSize());

        PaginationResponse<DownloadReportResponseDto> response = reportService.getDownloadRequests(
                requestDto.getRequestedBy(),
                requestDto.getReportCode(),
                requestDto.getFormat(),
                requestDto.getRequestedAt(),
                pageable
        );

        return ResponseEntity.ok(response);
    }

}
