package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.api.dto.TicketDto;
import com.ticketingSystem.api.service.TicketService;
import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class TicketSearchReportRequestDataProvider implements ReportRequestDataProvider {
    private final TicketService ticketService;

    @Override
    public boolean supports(String reportCode, ReportMaster reportMaster, Map<String, Object> filters) {
        log.info("TicketSearchReportRequestDataProvider.supports reportCode={} reportMasterCode={} filterKeys={}",
                reportCode, reportMaster != null ? reportMaster.getReportCode() : null, filters != null ? filters.keySet() : null);
        return !"SLA_SUMMARY_RPT".equalsIgnoreCase(reportCode);
    }

    @Override
    public List<?> fetchRows(Map<String, Object> filters) {
        log.info("TicketSearchReportRequestDataProvider.fetchRows called filterKeys={}", filters != null ? filters.keySet() : null);
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
                (String) filters.get("toDate"),
                (String) filters.get("breachedOnFromDate"),
                (String) filters.get("breachedOnToDate"),
                (String) filters.get("lastModifiedStatusFromDate"),
                (String) filters.get("lastModifiedStatusToDate")
        );
        log.info("TicketSearchReportRequestDataProvider.fetchRows returning {} rows", results.size());
        return results;
    }

    @Override
    public Map<String, Object> buildParams(Map<String, Object> filters, ReportMaster reportMaster, ReportFormat format) {
        log.info("TicketSearchReportRequestDataProvider.buildParams called reportCode={} format={}",
                reportMaster != null ? reportMaster.getReportCode() : null, format);
        Map<String, Object> params = new HashMap<>();
        params.put("USE_TEMPLATE_SQL", "template_sql".equalsIgnoreCase(reportMaster.getSourceType()));
        params.put("generatedOn", LocalDateTime.now().toString());
        params.put("fromDate", toNullableParam(filters.get("fromDate")));
        params.put("toDate", toNullableParam(filters.get("toDate")));
        params.put("lastModifiedStatusFromDate", toNullableParam(filters.get("lastModifiedStatusFromDate")));
        params.put("lastModifiedStatusToDate", toNullableParam(filters.get("lastModifiedStatusToDate")));
        params.put("fromDateLabel", formatValue(filters.get("fromDate")));
        params.put("toDateLabel", formatValue(filters.get("toDate")));
        params.put("zoneCodeLabel", preferredLabel(filters, "zoneLabel", "zoneCode"));
        params.put("regionCodeLabel", preferredLabel(filters, "regionLabel", "regionCode"));
        params.put("districtCodeLabel", preferredLabel(filters, "districtLabel", "districtCode"));
        params.put("issueTypeLabelFilter", preferredLabel(filters, "issueTypeLabel", "issueTypeId"));
        params.put("statusId", toNullableParam(filters.get("statusId")));
        params.put("priorityId", toNullableParam(firstNonEmpty(filters.get("priorityId"), filters.get("priority"))));
        params.put("severityId", toNullableParam(firstNonEmpty(filters.get("severityId"), filters.get("severity"))));
        params.put("assignedToName", formatValue(filters.get("assignedToName")));
        params.put("assignedBackFromFci", formatValue(filters.get("assignedBackFromFci")));
        params.put("assignedBy", formatValue(filters.get("assignedBy")));
        params.put("subCategory", toNullableParam(preferredLabel(filters, "subCategoryLabel", "subCategoryId")));
        params.put("subCategoryId", toNullableParam(formatValue(filters.get("subCategoryId"))));
        params.put("requestorId", formatValue(filters.get("requestorId")));
        params.put("createdBy", formatValue(filters.get("createdBy")));
        params.put("levelId", formatValue(filters.get("levelId")));
        params.put("division", preferredLabel(filters, "divisionLabel", "divisionId"));
        params.put("category", toNullableParam(preferredLabel(filters, "categoryLabel", "categoryId")));
        params.put("categoryId", toNullableParam(formatValue(filters.get("categoryId"))));
        params.put("filterSummary", buildFilterSummary(filters));
        params.put("zoneCode", toNullableParam(filters.get("zoneCode")));
        params.put("regionCode", toNullableParam(filters.get("regionCode")));
        params.put("districtCode", toNullableParam(filters.get("districtCode")));
        params.put("issueTypeId", toNullableParam(filters.get("issueTypeId")));
        log.info("TicketSearchReportRequestDataProvider.buildParams built {} params", params.size());
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
                .map(entry -> toLabel(entry.getKey()) + ": " + (isAllValue(resolveDisplayValue(entry.getKey(), filters)) ? "All" : formatValue(resolveDisplayValue(entry.getKey(), filters))))
                .collect(Collectors.joining(" | "));
    }


    private Object resolveDisplayValue(String key, Map<String, Object> filters) {
        if (key == null) return null;
        return switch (key) {
            case "categoryId" -> preferredLabel(filters, "categoryLabel", "categoryId");
            case "subCategoryId" -> preferredLabel(filters, "subCategoryLabel", "subCategoryId");
            case "statusId" -> preferredLabel(filters, "statusLabel", "statusId");
            case "zoneCode" -> preferredLabel(filters, "zoneLabel", "zoneCode");
            case "regionCode" -> preferredLabel(filters, "regionLabel", "regionCode");
            case "districtCode" -> preferredLabel(filters, "districtLabel", "districtCode");
            case "issueTypeId" -> preferredLabel(filters, "issueTypeLabel", "issueTypeId");
            case "divisionId" -> preferredLabel(filters, "divisionLabel", "divisionId");
            default -> filters.get(key);
        };
    }

    private String preferredLabel(Map<String, Object> filters, String labelKey, String fallbackKey) {
        String label = formatValue(filters.get(labelKey));
        if (!label.isBlank()) return label;
        return formatValue(filters.get(fallbackKey));
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
