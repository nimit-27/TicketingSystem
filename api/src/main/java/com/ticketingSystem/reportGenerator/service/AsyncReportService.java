package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.api.service.OciUploadService;
import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.enums.RequestStatus;
import com.ticketingSystem.reportGenerator.models.ReportArtifact;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import com.ticketingSystem.reportGenerator.models.ReportRequestHistory;
import com.ticketingSystem.reportGenerator.repository.ReportArtifactRepository;
import com.ticketingSystem.reportGenerator.repository.ReportMasterRepository;
import com.ticketingSystem.reportGenerator.repository.ReportRequestHistoryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@Service
//@RequiredArgsConstructor
@Slf4j
public class AsyncReportService {
    private final ReportRequestHistoryRepository reportRequestHistoryRepository;
    private final ReportArtifactRepository reportArtifactRepository;
    private final ReportMasterRepository reportMasterRepository;
    private final ReportDownloadService reportDownloadService;
    private final OciUploadService ociUploadService;
//    @Qualifier("notificationTaskExecutor")
    private final TaskExecutor taskExecutor;
    private final ObjectMapper objectMapper;
    private final List<ReportRequestDataProvider> reportRequestDataProviders;

    public AsyncReportService(
    ReportRequestHistoryRepository reportRequestHistoryRepository,
    ReportArtifactRepository reportArtifactRepository,
    ReportMasterRepository reportMasterRepository,
    ReportDownloadService reportDownloadService,
    OciUploadService ociUploadService,
    @Qualifier("notificationTaskExecutor") TaskExecutor taskExecutor,
    ObjectMapper objectMapper,
    List<ReportRequestDataProvider> reportRequestDataProviders
    ) {
        this.reportRequestHistoryRepository = reportRequestHistoryRepository;
        this.reportArtifactRepository = reportArtifactRepository;
        this.reportMasterRepository = reportMasterRepository;
        this.reportDownloadService = reportDownloadService;
        this.ociUploadService = ociUploadService;
        this.taskExecutor = taskExecutor;
        this.objectMapper = objectMapper;
        this.reportRequestDataProviders = reportRequestDataProviders;
    }


    public ReportRequestHistory queueTicketExport(String reportCode, ReportFormat format, Map<String, Object> filters, String requestedBy) {
        ReportMaster reportMaster = reportMasterRepository.findByReportCodeAndActiveTrue(reportCode)
                .orElseThrow(() -> new IllegalArgumentException("Report definition not found for code: " + reportCode));

        ReportRequestHistory request = new ReportRequestHistory();
        request.setReport(reportMaster);
        request.setRequestedBy(requestedBy != null ? requestedBy : "SYSTEM");
        request.setStatus(RequestStatus.QUEUED.name());
        request.setOutputFormat(format.name());
        request.setFiltersJson(toFiltersJson(filters));
        request = reportRequestHistoryRepository.save(request);

        final String requestId = request.getRequestId();
        taskExecutor.execute(() -> processRequest(requestId, reportCode, format, filters));
        return request;
    }

    private void processRequest(String requestId, String reportCode, ReportFormat format, Map<String, Object> filters) {
        ReportRequestHistory request = reportRequestHistoryRepository.findById(requestId).orElse(null);
        if (request == null) return;
        try {
            request.setStatus(RequestStatus.IN_PROGRESS.name());
            request.setStartedAt(LocalDateTime.now());
            reportRequestHistoryRepository.save(request);

            ReportMaster reportMaster = reportMasterRepository.findByReportCodeAndActiveTrue(reportCode)
                    .orElseThrow(() -> new IllegalArgumentException("Report definition not found for code: " + reportCode));

            ReportRequestDataProvider provider = reportRequestDataProviders.stream()
                    .filter(candidate -> candidate.supports(reportCode, reportMaster, filters))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No report data provider configured for code: " + reportCode));

            List<?> results = provider.fetchRows(filters != null ? filters : Collections.emptyMap());
            Map<String, Object> params = provider.buildParams(filters != null ? filters : Collections.emptyMap(), reportMaster, format);

            byte[] file = reportDownloadService.generate(reportCode, format, results, params);
            String ext = format == ReportFormat.PDF ? "pdf" : "xlsx";
            String filename = reportCode.toLowerCase() + "_" + LocalDate.now() + "_" + requestId + "." + ext;
            String objectName = "reports/" + filename;
            ociUploadService.uploadFile(objectName, file);

            ReportArtifact artifact = new ReportArtifact();
            artifact.setRequest(request);
            artifact.setFileName(filename);
            artifact.setContentType(format == ReportFormat.PDF ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            artifact.setFileSize((long) file.length);
            artifact.setStorageLocation(objectName);
            reportArtifactRepository.save(artifact);

            request.setStatus(RequestStatus.COMPLETED.name());
            request.setCompletedAt(LocalDateTime.now());
            request.setExpiresAt(LocalDateTime.now().plusDays(7));
            reportRequestHistoryRepository.save(request);
        } catch (Exception e) {
            log.error("Async report generation failed for request {}", requestId, e);
            request.setStatus(RequestStatus.FAILED.name());
            request.setFailedAt(LocalDateTime.now());
            request.setErrorMessage(e.getMessage());
            reportRequestHistoryRepository.save(request);
        }
    }


    private String toFiltersJson(Map<String, Object> filters) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("filters", new ArrayList<>(filters.entrySet().stream()
                .filter(entry -> entry.getKey() != null && !entry.getKey().equals("query") && !entry.getKey().equals("dateParam"))
                .map(entry -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("key", entry.getKey());
                    row.put("label", toLabel(entry.getKey()));
                    row.put("type", inferType(entry.getValue()));
                    row.put("value", entry.getValue());
                    boolean isAll = isAllValue(entry.getValue());
                    row.put("is_all", isAll);
                    return row;
                })
                .collect(Collectors.toList())));
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize filters_json", e);
            return "{\"filters\":[]}";
        }
    }


    private boolean isAllValue(Object value) {
        if (value == null) return true;
        if (value instanceof String str) return str.trim().isEmpty();
        if (value instanceof List<?> list) return list.isEmpty();
        return false;
    }

    private String formatValue(Object value) {
        if (isAllValue(value)) return "";
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).collect(Collectors.joining(", "));
        }
        return String.valueOf(value);
    }

    private String inferType(Object value) {
        if (value instanceof List<?>) return "multi_select";
        if (value instanceof Boolean) return "boolean";
        return "single_select";
    }

    private String toLabel(String key) {
        String spaced = key.replaceAll("([a-z])([A-Z])", "$1 $2").replace('_', ' ').trim();
        if (spaced.isEmpty()) return key;
        return Character.toUpperCase(spaced.charAt(0)) + spaced.substring(1);
    }

}
