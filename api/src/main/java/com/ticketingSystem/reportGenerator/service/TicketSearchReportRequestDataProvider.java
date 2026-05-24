package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.api.dto.TicketDto;
import com.ticketingSystem.api.service.TicketService;
import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TicketSearchReportRequestDataProvider implements ReportRequestDataProvider {
    private final TicketService ticketService;

    @Override
    public boolean supports(String reportCode, ReportMaster reportMaster, Map<String, Object> filters) {
        return true;
    }

    @Override
    public List<?> fetchRows(Map<String, Object> filters) {
        List<TicketDto> results = ticketService.searchTicketsList(
                (String) filters.getOrDefault("query", ""),
                (String) filters.get("statusId"),
                (Boolean) filters.get("master"),
                (Boolean) filters.get("assignedBackFromFci"),
                (String) filters.get("assignedTo"),
                (String) filters.get("assignedBy"),
                (String) filters.get("requestorId"),
                (String) filters.get("levelId"),
                (String) filters.get("priority"),
                (String) filters.get("severity"),
                (String) filters.get("createdBy"),
                (String) filters.get("categoryId"),
                (String) filters.get("subCategoryId"),
                (String) filters.get("zoneCode"),
                (String) filters.get("regionCode"),
                (String) filters.get("districtCode"),
                (String) filters.get("issueTypeId"),
                (String) filters.get("divisionId"),
                (String) filters.get("breachOption"),
                (Integer) filters.get("breachInMinutes"),
                (String) filters.getOrDefault("dateParam", "reported_date"),
                (String) filters.get("fromDate"),
                (String) filters.get("toDate")
        );
        return results;
    }

    @Override
    public Map<String, Object> buildParams(Map<String, Object> filters, ReportMaster reportMaster, ReportFormat format) {
        Map<String, Object> params = new HashMap<>();
        params.put("USE_TEMPLATE_SQL", "template_sql".equalsIgnoreCase(reportMaster.getSourceType()));
        params.put("generatedOn", LocalDateTime.now().toString());
        params.put("fromDate", toNullableParam(filters.get("fromDate")));
        params.put("toDate", toNullableParam(filters.get("toDate")));
        params.put("fromDateLabel", formatValue(filters.get("fromDate")));
        params.put("toDateLabel", formatValue(filters.get("toDate")));
        params.put("zoneCodeLabel", formatValue(filters.get("zoneCode")));
        params.put("regionCodeLabel", formatValue(filters.get("regionCode")));
        params.put("districtCodeLabel", formatValue(filters.get("districtCode")));
        params.put("issueTypeLabelFilter", formatValue(filters.get("issueTypeId")));
        params.put("statusId", toNullableParam(filters.get("statusId")));
        params.put("priorityId", toNullableParam(firstNonEmpty(filters.get("priorityId"), filters.get("priority"))));
        params.put("severityId", toNullableParam(firstNonEmpty(filters.get("severityId"), filters.get("severity"))));
        params.put("assignedToName", formatValue(filters.get("assignedToName")));
        params.put("assignedBackFromFci", formatValue(filters.get("assignedBackFromFci")));
        params.put("assignedBy", formatValue(filters.get("assignedBy")));
        params.put("subCategory", toNullableParam(formatValue(filters.get("subCategoryId"))));
        params.put("subCategoryId", toNullableParam(formatValue(filters.get("subCategoryId"))));
        params.put("requestorId", formatValue(filters.get("requestorId")));
        params.put("createdBy", formatValue(filters.get("createdBy")));
        params.put("levelId", formatValue(filters.get("levelId")));
        params.put("division", formatValue(filters.get("divisionId")));
        params.put("category", toNullableParam(formatValue(filters.get("categoryId"))));
        params.put("categoryId", toNullableParam(formatValue(filters.get("categoryId"))));
        params.put("filterSummary", buildFilterSummary(filters));
        params.put("zoneCode", toNullableParam(filters.get("zoneCode")));
        params.put("regionCode", toNullableParam(filters.get("regionCode")));
        params.put("districtCode", toNullableParam(filters.get("districtCode")));
        params.put("issueTypeId", toNullableParam(filters.get("issueTypeId")));
        return params;
    }

    private Object toNullableParam(Object value) {
        if (value == null) return null;
        if (value instanceof String str) {
            String trimmed = str.trim();
            return trimmed.isEmpty() ? null : trimmed;
        }
        if (value instanceof List<?> list) {
            return list.isEmpty() ? null : value;
        }
        return value;
    }

    private Object firstNonEmpty(Object preferred, Object fallback) {
        Object first = toNullableParam(preferred);
        return first != null ? first : toNullableParam(fallback);
    }

    private String buildFilterSummary(Map<String, Object> filters) {
        return filters.entrySet().stream()
                .filter(entry -> entry.getKey() != null && !entry.getKey().equals("query") && !entry.getKey().equals("dateParam"))
                .map(entry -> toLabel(entry.getKey()) + ": " + (isAllValue(entry.getValue()) ? "All" : formatValue(entry.getValue())))
                .collect(Collectors.joining(" | "));
    }

    private boolean isAllValue(Object value) {
        if (value == null) return true;
        if (value instanceof String str) return str.trim().isEmpty();
        if (value instanceof List<?> list) return list.isEmpty();
        return false;
    }

    private String formatValue(Object value) {
        if (isAllValue(value)) return "";
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).collect(Collectors.joining(", "));
        }
        return String.valueOf(value);
    }

    private String toLabel(String key) {
        String spaced = key.replaceAll("([a-z])([A-Z])", "$1 $2").replace('_', ' ').trim();
        if (spaced.isEmpty()) return key;
        return Character.toUpperCase(spaced.charAt(0)) + spaced.substring(1);
    }
}
