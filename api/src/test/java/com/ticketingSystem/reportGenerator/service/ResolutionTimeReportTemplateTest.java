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
    void queryGroupsFiltersAndOrdersByResolutionDate() throws Exception {
        ClassPathResource resource = new ClassPathResource(TEMPLATE);
        String jrxml = resource.getContentAsString(StandardCharsets.UTF_8);

        assertTrue(jrxml.contains("DATE_FORMAT(t.resolved_at, '%Y-%m-%d')"));
        assertTrue(jrxml.contains("t.resolved_at &gt;=") || jrxml.contains("t.resolved_at >="));
        assertTrue(jrxml.contains("ORDER BY MIN(t.resolved_at)"));
        assertFalse(jrxml.contains("DATE_FORMAT(t.reported_date"));
        assertFalse(jrxml.contains("WHERE t.reported_date"));
    }

    @Test
    void templateCompilesForPdfAndExcelGenerators() throws Exception {
        ClassPathResource resource = new ClassPathResource(TEMPLATE);
        try (var input = resource.getInputStream()) {
            JasperCompileManager.compileReport(input);
        }
    }
}
