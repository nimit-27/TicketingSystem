package com.ticketingSystem.reportGenerator.service;

import net.sf.jasperreports.engine.JasperCompileManager;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProblemManagementReportTemplateTest {

    private static final String TEMPLATE = "reports/mis_problem_management_report.jrxml";

    @Test
    void queryDisplaysModuleAndSubModuleNames() throws Exception {
        ClassPathResource resource = new ClassPathResource(TEMPLATE);
        String jrxml = resource.getContentAsString(StandardCharsets.UTF_8);

        assertTrue(jrxml.contains("LEFT JOIN categories c ON c.category_id = t.category"));
        assertTrue(jrxml.contains("LEFT JOIN sub_categories sc ON sc.sub_category_id = t.sub_category"));
        assertTrue(jrxml.contains("COALESCE(c.category,'N/A') category"));
        assertTrue(jrxml.contains("COALESCE(sc.sub_category,'N/A') subCategory"));
        assertFalse(jrxml.contains("COALESCE(t.category,'N/A') category"));
        assertFalse(jrxml.contains("COALESCE(t.sub_category,'N/A') subCategory"));
    }

    @Test
    void displaysOnlyCreatedTicketCountWithWiderSubModuleColumn() throws Exception {
        ClassPathResource resource = new ClassPathResource(TEMPLATE);
        String jrxml = resource.getContentAsString(StandardCharsets.UTF_8);

        assertTrue(jrxml.contains("<![CDATA[Tickets Created]]>"));
        assertTrue(jrxml.contains("x=\"230\" y=\"0\" width=\"412\" height=\"28\""));
        assertFalse(jrxml.contains("name=\"breachedTickets\""));
        assertFalse(jrxml.contains("name=\"resolvedTickets\""));
        assertFalse(jrxml.contains("name=\"closedTickets\""));
        assertFalse(jrxml.contains("LEFT JOIN ticket_sla"));
    }

    @Test
    void templateCompilesForReportGenerators() throws Exception {
        ClassPathResource resource = new ClassPathResource(TEMPLATE);
        try (var input = resource.getInputStream()) {
            JasperCompileManager.compileReport(input);
        }
    }
}
