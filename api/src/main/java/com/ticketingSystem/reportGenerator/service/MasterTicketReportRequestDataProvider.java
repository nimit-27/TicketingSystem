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
public class MasterTicketReportRequestDataProvider implements ReportRequestDataProvider {

    private static final String TEMPLATE_LOCATION = "reports/master_ticket_report.jrxml";

    @Override
    public boolean supports(String reportCode, ReportMaster reportMaster, Map<String, Object> filters) {
        return reportMaster != null
                && reportMaster.getTemplateLocation() != null
                && TEMPLATE_LOCATION.equalsIgnoreCase(reportMaster.getTemplateLocation());
    }

    @Override
    public List<?> fetchRows(Map<String, Object> filters) {
        return Collections.emptyList();
    }

    @Override
    public Map<String, Object> buildParams(Map<String, Object> filters, ReportMaster reportMaster, ReportFormat format) {
        Map<String, Object> params = new HashMap<>();
        params.put("USE_TEMPLATE_SQL", Boolean.TRUE);
        params.put("generatedOn", LocalDateTime.now().toString());
        return params;
    }
}
