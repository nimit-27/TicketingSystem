package com.ticketingSystem.reportGenerator.generators;

import net.sf.jasperreports.engine.JasperCompileManager;
import org.junit.jupiter.api.Test;

import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class SlaReportTemplateTest {

    @Test
    void slaReportTemplateCompiles() throws Exception {
        try (InputStream template = getClass().getResourceAsStream("/reports/sla_report.jrxml")) {
            assertNotNull(template, "SLA report JRXML must be available on the classpath");
            assertNotNull(JasperCompileManager.compileReport(template));
        }
    }
}
