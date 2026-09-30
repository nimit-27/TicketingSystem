package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SlaSummaryReportRequestDataProviderTest {

    private final SlaSummaryReportRequestDataProvider provider =
            new SlaSummaryReportRequestDataProvider("2026-07-01");

    @Test
    void supportsTheOriginalAndWorkbookReportCodes() {
        assertTrue(provider.supports("SLA_SUMMARY_RPT", null, Map.of()));
        assertTrue(provider.supports("SLA_SUMMARY_RPT_2", null, Map.of()));
    }

    @Test
    void appliesTheDefaultReportingPeriodWhenDatesAreMissing() {
        Map<String, Object> params = provider.buildParams(Map.of(), null, ReportFormat.EXCEL);

        assertEquals("2026-07-01", params.get("fromDate"));
        assertEquals(LocalDate.now().toString(), params.get("toDate"));
    }

    @Test
    void retainsDatesSuppliedByTheUser() {
        Map<String, Object> params = provider.buildParams(
                Map.of("fromDate", "2026-08-01", "toDate", "2026-08-31"),
                null,
                ReportFormat.PDF);

        assertEquals("2026-08-01", params.get("fromDate"));
        assertEquals("2026-08-31", params.get("toDate"));
    }
}
