package com.ticketingSystem.reportGenerator.service;

import com.ticketingSystem.api.dto.TicketDto;
import com.ticketingSystem.api.service.OciUploadService;
import com.ticketingSystem.api.service.TicketService;
import com.ticketingSystem.reportGenerator.enums.ReportFormat;
import com.ticketingSystem.reportGenerator.enums.RequestStatus;
import com.ticketingSystem.reportGenerator.models.ReportArtifact;
import com.ticketingSystem.reportGenerator.models.ReportMaster;
import com.ticketingSystem.reportGenerator.models.ReportRequestHistory;
import com.ticketingSystem.reportGenerator.repository.ReportArtifactRepository;
import com.ticketingSystem.reportGenerator.repository.ReportMasterRepository;
import com.ticketingSystem.reportGenerator.repository.ReportRequestHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncReportService {
    private final ReportRequestHistoryRepository reportRequestHistoryRepository;
    private final ReportArtifactRepository reportArtifactRepository;
    private final ReportMasterRepository reportMasterRepository;
    private final TicketService ticketService;
    private final ReportDownloadService reportDownloadService;
    private final OciUploadService ociUploadService;
    @Qualifier("notificationTaskExecutor")
    private final TaskExecutor taskExecutor;

    public ReportRequestHistory queueTicketExport(String reportCode, ReportFormat format, Map<String, Object> filters, Long requestedBy) {
        ReportMaster reportMaster = reportMasterRepository.findByReportCodeAndActiveTrue(reportCode)
                .orElseThrow(() -> new IllegalArgumentException("Report definition not found for code: " + reportCode));

        ReportRequestHistory request = new ReportRequestHistory();
        request.setReport(reportMaster);
        request.setRequestedBy(requestedBy != null ? requestedBy : 0L);
        request.setStatus(RequestStatus.QUEUED.name());
        request.setOutputFormat(format.name());
        request = reportRequestHistoryRepository.save(request);

        final Long requestId = request.getRequestId();
        taskExecutor.execute(() -> processRequest(requestId, reportCode, format, filters));
        return request;
    }

    private void processRequest(Long requestId, String reportCode, ReportFormat format, Map<String, Object> filters) {
        ReportRequestHistory request = reportRequestHistoryRepository.findById(requestId).orElse(null);
        if (request == null) return;
        try {
            request.setStatus(RequestStatus.IN_PROGRESS.name());
            request.setStartedAt(LocalDateTime.now());
            reportRequestHistoryRepository.save(request);

            List<TicketDto> results = ticketService.searchTicketsList(
                    (String) filters.getOrDefault("query", ""),
                    (String) filters.get("statusId"),
                    (Boolean) filters.get("master"),
                    (Boolean) filters.get("assignedBackFromFci"),
                    (String) filters.get("assignedTo"),
                    (String) filters.get("assignedBy"),
                    (String) filters.get("requestorId"),
                    (String) filters.get("levelId"),
                    (String) filters.get("priority"),
                    (String) filters.get("severity"),
                    (String) filters.get("createdBy"),
                    (String) filters.get("category"),
                    (String) filters.get("subCategory"),
                    (String) filters.get("zoneCode"),
                    (String) filters.get("regionCode"),
                    (String) filters.get("districtCode"),
                    (String) filters.get("issueTypeId"),
                    (String) filters.get("divisionId"),
                    (String) filters.get("breachOption"),
                    (Integer) filters.get("breachInMinutes"),
                    (String) filters.getOrDefault("dateParam", "reported_date"),
                    (String) filters.get("fromDate"),
                    (String) filters.get("toDate")
            );

            Map<String, Object> params = new HashMap<>();
            params.put("generatedOn", LocalDateTime.now().toString());
            params.put("fromDate", filters.get("fromDate"));
            params.put("toDate", filters.get("toDate"));

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
}
