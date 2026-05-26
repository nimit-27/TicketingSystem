package com.ticketingSystem.reportGenerator.repository;

import com.ticketingSystem.api.dto.DownloadRequestDto;
import com.ticketingSystem.reportGenerator.models.ReportRequestHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRequestHistoryRepository extends JpaRepository<ReportRequestHistory, String> {
    List<ReportRequestHistory> findTop50ByOrderByRequestedAtDesc();

    @Query("Select " +
            "r.request_id, r. " +
            "rm.report_code" +
            "r.output_format" +
            "r.requested_by" +
            "r.requested_at" +
            "r.requested_at" +
            "r.completed_at" +
            "ra.filters_json" +
            "r.failed_at" +
            "r.error_message" +
            "r.expires_at" +
            "ra.filename" +
            "ra.storage_location" +
            "FROM report_request_history rrh " +
            "LEFT JOIN report_artifact ra " +
            "ON rrh.request_id = ra.request_id " +
            "LEFT JOIN report_master rm " +
            "ON rm.report_id = rrh.report_id" +
            "WHERE (:requestedById IS NULL OR r.requested_by = :requestedById) " +
            "AND (:reportCode IS NULL OR rm.report_code = :reportCode) " +
            "AND (:format IS NULL OR r.output_format = :format) " +
            "AND (:requestedAt IS NULL OR r.requested_at = :requestedAt) "
    )
    Page<DownloadRequestDto> findDownloadRequests(@Param("requestedById") String requestedBy,
                                                  @Param("reportCode") String reportCode,
                                                  @Param("format") String format,
                                                  @Param("requestedAt") String requestedAt,
                                                  Pageable pageable);
}
