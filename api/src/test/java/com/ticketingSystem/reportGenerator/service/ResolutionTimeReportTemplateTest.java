package com.ticketingSystem.reportGenerator.service;

import net.sf.jasperreports.engine.JasperCompileManager;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResolutionTimeReportTemplateTest {

    private static final String TEMPLATE = "reports/mis_resolution_time_report.jrxml";

    @Test
    void queryGroupsFiltersAndOrdersByReportedDate() throws Exception {
        ClassPathResource resource = new ClassPathResource(TEMPLATE);
        String jrxml = resource.getContentAsString(StandardCharsets.UTF_8);

        assertTrue(jrxml.contains("DATE_FORMAT(t.reported_date, '%Y-%m-%d')"));
        assertTrue(jrxml.contains("t.reported_date &gt;=") || jrxml.contains("t.reported_date >="));
        assertTrue(jrxml.contains("ORDER BY MIN(t.reported_date)"));
        assertFalse(jrxml.contains("DATE_FORMAT(t.resolved_at"));
    }

    @Test
    void displaysOneResolvedTicketCountWithoutStatusColumns() throws Exception {
        ClassPathResource resource = new ClassPathResource(TEMPLATE);
        String jrxml = resource.getContentAsString(StandardCharsets.UTF_8);

        assertTrue(jrxml.contains("Total Resolved Tickets"));
        assertFalse(jrxml.contains("resolvedStatus"));
        assertFalse(jrxml.contains("closedStatus"));
    }

    @Test
    void templateCompilesForPdfAndExcelGenerators() throws Exception {
        ClassPathResource resource = new ClassPathResource(TEMPLATE);
        try (var input = resource.getInputStream()) {
            JasperCompileManager.compileReport(input);
        }
    }
}
