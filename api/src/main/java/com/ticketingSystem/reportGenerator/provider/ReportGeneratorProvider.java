package com.ticketingSystem.reportGenerator.provider;

import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ReportGeneratorProvider {
    @Value("${report.engine:default}")
    private String reportEngine;

    @Value("${report.generate.default.pdf:}")
    private String defaultPdfBeanName;

    @Value("${report.generate.default.excel:}")
    private String defaultExcelBeanName;

    private final ApplicationContext ctx;

    public ReportGeneratorProvider(ApplicationContext ctx) {
        this.ctx = ctx;
    }

    public ReportGenerator getGenerator(ReportFormat format) {
        String engine = StringUtils.hasText(reportEngine) ? reportEngine.trim().toLowerCase() : "default";

        String beanNameFromEngineAndFormat = "report.generate." + engine + "." + format.name().toLowerCase();

        String beanName = ctx.getEnvironment().getProperty(beanNameFromEngineAndFormat);

        if(!StringUtils.hasText(beanName)) {
            beanName = switch (format) {
                case PDF -> defaultPdfBeanName;
                case EXCEL -> defaultExcelBeanName;
            };
        }

        if(!StringUtils.hasText(beanName)) {
            throw new IllegalArgumentException("No report generator bean configured for an engine=" + engine + ", format=" + format);
        }

        if(!ctx.containsBean(beanName)) {
            throw new IllegalArgumentException("Configured report generator bean not found: " + beanName);
        }

        return ctx.getBean(beanName, ReportGenerator.class);
    }
}
