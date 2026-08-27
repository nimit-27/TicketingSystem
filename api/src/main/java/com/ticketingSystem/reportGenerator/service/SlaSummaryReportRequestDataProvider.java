package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Order(0)
public class SlaSummaryReportRequestDataProvider implements ReportRequestDataProvider {
    private static final String REPORT_CODE = "SLA_SUMMARY_RPT";

    @Override
    public boolean supports(String reportCode, ReportMaster reportMaster, Map<String, Object> filters) {
        return REPORT_CODE.equalsIgnoreCase(reportCode);
    }

    @Override
    public List<?> fetchRows(Map<String, Object> filters) {
        // This report is filled by Jasper using the parameterized SQL in its template.
        return Collections.emptyList();
    }

    @Override
    public Map<String, Object> buildParams(Map<String, Object> filters, ReportMaster reportMaster, ReportFormat format) {
        Map<String, Object> params = new HashMap<>();
        params.put("USE_TEMPLATE_SQL", true);
        params.put("generatedOn", LocalDateTime.now().toString());
        params.put("fromDate", nullableString(filters.get("fromDate")));
        params.put("toDate", nullableString(filters.get("toDate")));
        params.put("breachedOnFromDate", nullableString(filters.get("breachedOnFromDate")));
        params.put("breachedOnToDate", nullableString(filters.get("breachedOnToDate")));
        return params;
    }

    private String nullableString(Object value) {
        if (value == null || value.toString().isBlank()) return null;
        return value.toString();
    }
}
