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
    private static final String TEMPLATE_LOCATION_V2 = "reports/master_ticket_report_v2.jrxml";

    @Override
    public boolean supports(String reportCode, ReportMaster reportMaster, Map<String, Object> filters) {
        return reportMaster != null
                && reportMaster.getTemplateLocation() != null
                && (TEMPLATE_LOCATION.equalsIgnoreCase(reportMaster.getTemplateLocation())
                || TEMPLATE_LOCATION_V2.equalsIgnoreCase(reportMaster.getTemplateLocation()));
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
        params.put("fromDate", toNullableString(filters.get("fromDate")));
        params.put("toDate", toNullableString(filters.get("toDate")));
        params.put("categoryId", toNullableString(filters.get("categoryId")));
        params.put("subCategoryId", toNullableString(filters.get("subCategoryId")));
        params.put("zoneCode", toNullableString(filters.get("zoneCode")));
        params.put("regionCode", toNullableString(filters.get("regionCode")));
        params.put("districtCode", toNullableString(filters.get("districtCode")));
        params.put("issueTypeId", toNullableString(filters.get("issueTypeId")));
        params.put("statusId", toNullableString(filters.get("statusId")));
        params.put("priorityId", toNullableString(firstNonEmpty(filters.get("priorityId"), filters.get("priority"))));
        params.put("severityId", toNullableString(firstNonEmpty(filters.get("severityId"), filters.get("severity"))));
        params.put("divisionId", toNullableString(firstNonEmpty(filters.get("divisionId"), filters.get("division"))));
        params.put("requestorPhoneNumber", toNullableString(firstNonEmpty(filters.get("requestorPhoneNumber"), filters.get("requestorMobileNo"))));
        params.put("requestorUserId", toNullableString(firstNonEmpty(filters.get("requestorUserId"), filters.get("userId"))));
        params.put("requestorEmailId", toNullableString(firstNonEmpty(filters.get("requestorEmailId"), filters.get("emailId"))));
        return params;
    }

    private Object firstNonEmpty(Object preferred, Object fallback) {
        return toNullableString(preferred) != null ? preferred : fallback;
    }

    private String toNullableString(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? null : text;
    }
}
