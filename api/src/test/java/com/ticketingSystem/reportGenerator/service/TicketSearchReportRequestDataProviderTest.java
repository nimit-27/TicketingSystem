package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.api.service.TicketService;
import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;

class TicketSearchReportRequestDataProviderTest {

    private final TicketSearchReportRequestDataProvider provider =
            new TicketSearchReportRequestDataProvider(mock(TicketService.class));

    @Test
    void buildParamsPassesResolutionReportGroupingAndFiltersToTemplateSql() {
        ReportMaster reportMaster = new ReportMaster();
        reportMaster.setSourceType("template_sql");

        Map<String, Object> params = provider.buildParams(Map.of(
                "interval", "DAILY",
                "divisionId", "DIV-1",
                "assignedTo", "agent-1"
        ), reportMaster, ReportFormat.PDF);

        assertEquals("DAILY", params.get("interval"));
        assertEquals("DIV-1", params.get("divisionId"));
        assertEquals("agent-1", params.get("assignedTo"));
    }

    @Test
    void buildParamsConvertsBlankResolutionReportParametersToNull() {
        ReportMaster reportMaster = new ReportMaster();
        reportMaster.setSourceType("template_sql");

        Map<String, Object> params = provider.buildParams(Map.of(
                "interval", " ",
                "divisionId", "",
                "assignedTo", "  "
        ), reportMaster, ReportFormat.EXCEL);

        assertNull(params.get("interval"));
        assertNull(params.get("divisionId"));
        assertNull(params.get("assignedTo"));
    }
}
