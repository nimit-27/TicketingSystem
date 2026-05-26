package com.ticketingSystem.reportGenerator.generators.pdf;

import com.ticketingSystem.reportGenerator.api.ReportContext;
import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import org.springframework.stereotype.Component;

@Component("openPdf")
public class OpenPdfReportGenerator implements ReportGenerator {
    @Override
    public byte[] generateReport(ReportContext context) {
        return new byte[0];
    }
}
