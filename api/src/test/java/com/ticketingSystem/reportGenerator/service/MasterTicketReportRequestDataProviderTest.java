package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MasterTicketReportRequestDataProviderTest {

    private final MasterTicketReportRequestDataProvider provider = new MasterTicketReportRequestDataProvider();

    @Test
    void buildParamsPassesLastModifiedStatusDateRangeToTemplateSql() {
        Map<String, Object> filters = new HashMap<>();
        filters.put("lastModifiedStatusFromDate", "2026-07-01 00:00:00");
        filters.put("lastModifiedStatusToDate", "2026-07-15 23:59:59");

        Map<String, Object> params = provider.buildParams(filters, new ReportMaster(), ReportFormat.EXCEL);

        assertEquals("2026-07-01 00:00:00", params.get("lastModifiedStatusFromDate"));
        assertEquals("2026-07-15 23:59:59", params.get("lastModifiedStatusToDate"));
    }

    @Test
    void buildParamsConvertsBlankLastModifiedStatusDatesToNull() {
        Map<String, Object> filters = new HashMap<>();
        filters.put("lastModifiedStatusFromDate", "  ");
        filters.put("lastModifiedStatusToDate", "");

        Map<String, Object> params = provider.buildParams(filters, new ReportMaster(), ReportFormat.PDF);

        assertNull(params.get("lastModifiedStatusFromDate"));
        assertNull(params.get("lastModifiedStatusToDate"));
    }
    @Test
    void supportsSlaTicketReportTemplate() {
        ReportMaster reportMaster = new ReportMaster();
        reportMaster.setTemplateLocation("reports/sla_ticket_report.jrxml");

        assertTrue(provider.supports("SLA_TICKETS_RPT", reportMaster, Map.of()));
    }

    @Test
    void buildParamsPassesBreachFilterToTemplateSql() {
        Map<String, Object> params = provider.buildParams(
                Map.of("breachOption", "BREACHED_IN"),
                new ReportMaster(),
                ReportFormat.EXCEL
        );

        assertEquals("BREACHED_IN", params.get("breachedFilter"));
    }

}
