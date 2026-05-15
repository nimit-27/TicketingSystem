package com.ticketingSystem.reportGenerator.provider;

import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class ReportGeneratorProvider {
    @Value("${report.engine:jasper}")
    private String reportEngine;

    @Value("${report.generate.jasper.pdf:jasperPdf}")
    private String jasperPdfBeanName;

    @Value("${report.generate.jasper.excel:jasperExcel}")
    private String jasperExcelBeanName;

    private final ApplicationContext ctx;

    public ReportGeneratorProvider(ApplicationContext ctx) {
        this.ctx = ctx;
    }

    public ReportGenerator getGenerator(ReportFormat format) {
        String engine = reportEngine == null ? "jasper" : reportEngine.trim().toLowerCase();
        if (!"jasper".equals(engine)) {
            throw new IllegalArgumentException("Unsupported report.engine: " + reportEngine);
        }

        return switch (format) {
            case PDF -> ctx.getBean(jasperPdfBeanName, ReportGenerator.class);
            case EXCEL -> ctx.getBean(jasperExcelBeanName, ReportGenerator.class);
        };
    }
}
