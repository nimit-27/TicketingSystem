package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.models.ReportMaster;

import java.util.List;
import java.util.Map;

public interface ReportRequestDataProvider {
    boolean supports(String reportCode, ReportMaster reportMaster, Map<String, Object> filters);

    List<?> fetchRows(Map<String, Object> filters);

    Map<String, Object> buildParams(Map<String, Object> filters, ReportMaster reportMaster, ReportFormat format);
}
