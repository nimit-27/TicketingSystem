package com.ticketingSystem.reportGenerator.generators;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperReport;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TicketSummaryReportTemplateTest {

    @Test
    void ticketSummaryTemplateCompiles() throws Exception {
        try (InputStream template = getClass().getResourceAsStream(
                "/reports/mis_ticket_summary_report.jrxml")) {
            assertNotNull(template, "Ticket Summary JRXML must be available on the classpath");
            JasperReport report = JasperCompileManager.compileReport(template);
            assertNotNull(report);
            assertTrue(Arrays.stream(report.getFields())
                    .anyMatch(field -> "modeSelfTickets".equals(field.getName())));
            assertTrue(Arrays.stream(report.getFields())
                    .anyMatch(field -> "modeCallTickets".equals(field.getName())));
            assertTrue(Arrays.stream(report.getFields())
                    .anyMatch(field -> "modeEmailTickets".equals(field.getName())));
            assertTrue(Arrays.stream(report.getVariables())
                    .anyMatch(variable -> "modeEmailTicketsSum".equals(variable.getName())));
            assertNotNull(report.getSummary(), "Ticket Summary report must end with a totals row");
        }
    }
}
