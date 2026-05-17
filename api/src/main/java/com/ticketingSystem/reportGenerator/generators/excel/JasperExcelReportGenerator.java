package com.ticketingSystem.reportGenerator.generators.excel;

import com.ticketingSystem.reportGenerator.api.ReportContext;
import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@Component("jasperExcel")
public class JasperExcelReportGenerator implements ReportGenerator {
    @Override
    public byte[] generateReport(ReportContext context) throws Exception {
        ClassPathResource resource = new ClassPathResource(context.getTemplateLocation());
        try (InputStream jrxml = resource.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            JasperReport jasperReport = JasperCompileManager.compileReport(jrxml);
            JRBeanCollectionDataSource datasource = new JRBeanCollectionDataSource(context.getRows());
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, context.getParams(), datasource);

            JRXlsxExporter exporter = new JRXlsxExporter();
            exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
            exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(out));
            SimpleXlsxReportConfiguration config = new SimpleXlsxReportConfiguration();
            config.setDetectCellType(true);
            config.setCollapseRowSpan(false);
            config.setWhitePageBackground(false);
            exporter.setConfiguration(config);
            exporter.exportReport();
            return out.toByteArray();
        }
    }
}
