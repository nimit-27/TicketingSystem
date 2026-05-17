package com.ticketingSystem.reportGenerator.generators.pdf;

import com.ticketingSystem.reportGenerator.api.ReportContext;
import com.ticketingSystem.reportGenerator.api.ReportGenerator;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.design.JRDesignBand;
import net.sf.jasperreports.engine.design.JRDesignExpression;
import net.sf.jasperreports.engine.design.JRDesignField;
import net.sf.jasperreports.engine.design.JRDesignSection;
import net.sf.jasperreports.engine.design.JRDesignStaticText;
import net.sf.jasperreports.engine.design.JRDesignTextField;
import net.sf.jasperreports.engine.design.JasperDesign;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component("jasperPdf")
public class JasperPdfReportGenerator implements ReportGenerator {

    /**
     * Phase-2 placeholder for fully dynamic report construction.
     * Keep this method unused for now; it documents the future direction.
     */
    private JasperDesign buildDynamicDesignForFuture(List<ColumnDefinition> selectedColumns) {
        JasperDesign design = new JasperDesign();
        design.setName("Ticket_Report_Dynamic");
        design.setPageWidth(1200);
        design.setPageHeight(1000);
        design.setLeftMargin(20);
        design.setRightMargin(20);
        design.setTopMargin(20);
        design.setBottomMargin(20);

        JRDesignBand header = new JRDesignBand();
        header.setHeight(20);
        JRDesignBand detail = new JRDesignBand();
        detail.setHeight(20);

        int x = 0;
        for (ColumnDefinition col : selectedColumns) {
            JRDesignField field = new JRDesignField();
            field.setName(col.fieldName());
            field.setValueClass(col.valueClass());
            try {
                design.addField(field);
            } catch (Exception ex) {
                throw new IllegalStateException("Unable to add dynamic field: " + col.fieldName(), ex);
            }

            JRDesignStaticText headerText = new JRDesignStaticText();
            headerText.setX(x);
            headerText.setY(0);
            headerText.setWidth(col.width());
            headerText.setHeight(20);
            headerText.setText(col.label());
            header.addElement(headerText);

            JRDesignTextField detailText = new JRDesignTextField();
            detailText.setX(x);
            detailText.setY(0);
            detailText.setWidth(col.width());
            detailText.setHeight(20);
            JRDesignExpression expression = new JRDesignExpression();
            expression.setText("$F{" + col.fieldName() + "}");
            detailText.setExpression(expression);
            detail.addElement(detailText);
            x += col.width();
        }

        design.setColumnHeader(header);
        ((JRDesignSection) design.getDetailSection()).addBand(detail);
        return design;
    }

    private record ColumnDefinition(String fieldName, String label, int width, Class<?> valueClass) {}

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
