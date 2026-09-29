package com.ticketingSystem.reportGenerator.generators;

import net.sf.jasperreports.engine.JasperCompileManager;
import org.junit.jupiter.api.Test;

import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class TicketSummaryReportTemplateTest {

    @Test
    void ticketSummaryTemplateCompiles() throws Exception {
        try (InputStream template = getClass().getResourceAsStream(
                "/reports/mis_ticket_summary_report.jrxml")) {
            assertNotNull(template, "Ticket Summary JRXML must be available on the classpath");
            assertNotNull(JasperCompileManager.compileReport(template));
        }
    }
}
