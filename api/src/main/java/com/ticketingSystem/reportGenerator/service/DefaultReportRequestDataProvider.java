package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DefaultReportRequestDataProvider implements ReportRequestDataProvider {
    @Override
    public boolean supports(String reportCode, ReportMaster reportMaster, Map<String, Object> filters) {
        return "template_sql".equalsIgnoreCase(reportMaster.getSourceType());
    }

    @Override
    public List<?> fetchRows(Map<String, Object> filters) {
        return Collections.emptyList();
    }

    @Override
    public Map<String, Object> buildParams(Map<String, Object> filters, ReportMaster reportMaster, ReportFormat format) {
        Map<String, Object> params = new HashMap<>();
        params.put("USE_TEMPLATE_SQL", true);
        params.put("generatedOn", LocalDateTime.now().toString());
        params.putAll(filters);
        return params;
    }
}
