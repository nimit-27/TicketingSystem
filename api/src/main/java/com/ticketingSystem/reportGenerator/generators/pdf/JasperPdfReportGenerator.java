package com.ticketingSystem.reportGenerator.generators.pdf;

import com.ticketingSystem.reportGenerator.api.ReportContext;
import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component("jasperPdf")
public class JasperPdfReportGenerator implements ReportGenerator {
    @Override
    public byte[] generateReport(ReportContext context) throws Exception {
        ClassPathResource resource = new ClassPathResource(context.getTemplateLocation());
        try (InputStream jrxml = resource.getInputStream()) {
            JasperReport jasperReport = JasperCompileManager.compileReport(jrxml);
            JRBeanCollectionDataSource datasource = new JRBeanCollectionDataSource(context.getRows());
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, context.getParams(), datasource);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        }
    }
}
