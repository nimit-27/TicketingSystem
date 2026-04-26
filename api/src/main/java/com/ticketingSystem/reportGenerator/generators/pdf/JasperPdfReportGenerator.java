package com.ticketingSystem.reportGenerator.generators.pdf;

import com.ticketingSystem.reportGenerator.api.ReportContext;
import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.stereotype.Component;

@Component("jasperPdf")
public class JasperPdfReportGenerator implements ReportGenerator {
    @Override
    public byte[] generateReport(ReportContext context) throws Exception {
        JasperReport jasperReport = JasperCompileManager.compileReport("");
        JRBeanCollectionDataSource datasource = new JRBeanCollectionDataSource(context.getRows());
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, context.getParams(), datasource);
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }
}
