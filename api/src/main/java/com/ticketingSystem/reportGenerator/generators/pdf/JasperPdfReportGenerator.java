package com.ticketingSystem.reportGenerator.generators.pdf;

import com.ticketingSystem.reportGenerator.api.ReportContext;
import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import org.springframework.stereotype.Component;

@Component("jasperPdf")
public class JasperPdfReportGenerator implements ReportGenerator {
    @Override
    public byte[] generateReport(ReportContext context) throws Exception {
        return new byte[0];
    }
}
