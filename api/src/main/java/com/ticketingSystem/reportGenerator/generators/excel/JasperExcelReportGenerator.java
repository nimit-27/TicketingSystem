package com.ticketingSystem.reportGenerator.generators.excel;

import com.ticketingSystem.reportGenerator.api.ReportContext;
import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@Component("jasperExcel")
public class JasperExcelReportGenerator implements ReportGenerator {

    private final DataSource dataSource;

    public JasperExcelReportGenerator(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    @Override
    public byte[] generateReport(ReportContext context) throws Exception {
        ClassPathResource resource = new ClassPathResource(context.getTemplateLocation());
        try (InputStream jrxml = resource.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Map<String, Object> params = withDefaultColumnVisibility(context.getParams());
            JasperReport jasperReport = JasperCompileManager.compileReport(jrxml);
            JasperPrint jasperPrint;
            if (Boolean.TRUE.equals(params.get("USE_TEMPLATE_SQL"))) {
                try (Connection connection = dataSource.getConnection()) {
                    jasperPrint = JasperFillManager.fillReport(jasperReport, params, connection);
                }
            } else {
                JRBeanCollectionDataSource datasource = new JRBeanCollectionDataSource(context.getRows());
                jasperPrint = JasperFillManager.fillReport(jasperReport, params, datasource);
            }

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

    private Map<String, Object> withDefaultColumnVisibility(Map<String, Object> incomingParams) {
        Map<String, Object> params = new HashMap<>();
        if (incomingParams != null) {
            params.putAll(incomingParams);
        }

        String[] visibilityParams = {
                "showTicketId", "showRequestor", "showCreatedDate", "showModule", "showSubModule",
                "showIssueType", "showZone", "showDistrict", "showRegion", "showSeverity",
                "showPriority", "showAssigneeName", "showStatus"
        };

        for (String key : visibilityParams) {
            params.putIfAbsent(key, Boolean.TRUE);
        }

        params.put(JRParameter.IS_IGNORE_PAGINATION, Boolean.TRUE);

        return params;
    }
}
