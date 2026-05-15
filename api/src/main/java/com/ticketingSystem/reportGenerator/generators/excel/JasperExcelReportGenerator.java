package com.ticketingSystem.reportGenerator.generators.excel;

import com.ticketingSystem.reportGenerator.api.ReportContext;
import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import org.springframework.stereotype.Component;

@Component("jasperExcel")
public class JasperExcelReportGenerator implements ReportGenerator {
    @Override
    public byte[] generateReport(ReportContext context) {
        return new byte[0];
    }
}
