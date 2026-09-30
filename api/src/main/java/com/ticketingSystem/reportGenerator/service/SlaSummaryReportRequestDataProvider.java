package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Order(0)
public class SlaSummaryReportRequestDataProvider implements ReportRequestDataProvider {
    private static final String REPORT_CODE = "SLA_SUMMARY_RPT";
    private static final String WORKBOOK_REPORT_CODE = "SLA_SUMMARY_RPT_2";
    private static final String DETAILED_REPORT_CODE = "SLA_DETAILED_RPT";
    private final String defaultFromDate;

    public SlaSummaryReportRequestDataProvider(
            @Value("${report.sla.default-from-date}") String defaultFromDate) {
        this.defaultFromDate = defaultFromDate;
    }

    @Override
    public boolean supports(String reportCode, ReportMaster reportMaster, Map<String, Object> filters) {
        return REPORT_CODE.equalsIgnoreCase(reportCode)
                || WORKBOOK_REPORT_CODE.equalsIgnoreCase(reportCode)
                || DETAILED_REPORT_CODE.equalsIgnoreCase(reportCode);
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
        params.put("fromDate", stringOrDefault(filters.get("fromDate"), defaultFromDate));
        params.put("toDate", stringOrDefault(filters.get("toDate"), LocalDate.now().toString()));
        params.put("breachedOnFromDate", nullableString(filters.get("breachedOnFromDate")));
        params.put("breachedOnToDate", nullableString(filters.get("breachedOnToDate")));
        params.put("interval", normalizedInterval(filters.get("interval")));
        return params;
    }

    private String normalizedInterval(Object value) {
        String interval = nullableString(value);
        return "QUARTERLY".equalsIgnoreCase(interval) ? "QUARTERLY" : "MONTHLY";
    }

    private String nullableString(Object value) {
        if (value == null || value.toString().isBlank()) return null;
        return value.toString();
    }

    private String stringOrDefault(Object value, String defaultValue) {
        String supplied = nullableString(value);
        return supplied == null ? defaultValue : supplied;
    }
}
