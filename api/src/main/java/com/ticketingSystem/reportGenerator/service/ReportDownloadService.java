package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.reportGenerator.api.ReportContext;
import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import com.ticketingSystem.reportGenerator.provider.ReportGeneratorProvider;
import com.ticketingSystem.reportGenerator.repository.ReportMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportDownloadService {
    private final ReportMasterRepository reportMasterRepository;
    private final ReportGeneratorProvider reportGeneratorProvider;

    public byte[] generate(String reportCode, ReportFormat format, List<?> rows, Map<String, Object> params) throws Exception {
        ReportMaster reportMaster = reportMasterRepository.findByReportCodeAndActiveTrue(reportCode)
                .orElseThrow(() -> new IllegalArgumentException("Report definition not found for code: " + reportCode));

        if (!StringUtils.hasText(reportMaster.getTemplateLocation())) {
            throw new IllegalArgumentException("Template location is missing for report code: " + reportCode);
        }

        Map<String, Object> effectiveParams = new HashMap<>();
        if (params != null) {
            effectiveParams.putAll(params);
        }
        effectiveParams.putIfAbsent("REPORT_CODE", reportCode);

        ReportContext context = new ReportContext(rows, effectiveParams, reportMaster.getTemplateLocation());
        return reportGeneratorProvider.getGenerator(format).generateReport(context);
    }
}
