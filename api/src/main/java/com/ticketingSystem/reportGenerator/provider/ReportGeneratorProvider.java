package com.ticketingSystem.reportGenerator.provider;

import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;

public class ReportGeneratorProvider {
    @Value("${report.generate.pdf}")
    private String pdfBeanName;

    @Value("${report.generate.excel}")
    private String excelBeanName;

    private final ApplicationContext ctx;

    public ReportGeneratorProvider(ApplicationContext ctx) {
        this.ctx = ctx;
    }

    public ReportGenerator getGenerator(ReportFormat format) {
        return switch (format) {
            case PDF -> ctx.getBean(pdfBeanName, ReportGenerator.class);
            case EXCEL -> ctx.getBean(excelBeanName, ReportGenerator.class);
        };
    }
}
