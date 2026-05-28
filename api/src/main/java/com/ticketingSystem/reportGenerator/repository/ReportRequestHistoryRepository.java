package com.ticketingSystem.reportGenerator.repository;

import com.ticketingSystem.reportGenerator.models.ReportRequestHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportRequestHistoryRepository extends JpaRepository<ReportRequestHistory, String> {
    List<ReportRequestHistory> findTop50ByOrderByRequestedAtDesc();

    @Query(value = "SELECT rrh.* FROM report_request_history rrh " +
            "LEFT JOIN report_master rm ON rm.report_id = rrh.report_id " +
            "WHERE (:requestedById IS NULL OR rrh.requested_by = :requestedById) " +
            "AND (:reportCode IS NULL OR rm.report_code = :reportCode) " +
            "AND (:format IS NULL OR rrh.output_format = :format) " +
            "AND (:status IS NULL OR rrh.status = :status) " +
            "AND (:requestedFrom IS NULL OR rrh.requested_at >= :requestedFrom) " +
            "AND (:requestedTo IS NULL OR rrh.requested_at < :requestedTo) " +
            "ORDER BY rrh.requested_at DESC ",
            countQuery = "SELECT COUNT(*) FROM report_request_history rrh " +
                    "LEFT JOIN report_master rm ON rm.report_id = rrh.report_id " +
                    "WHERE (:requestedById IS NULL OR rrh.requested_by = :requestedById) " +
                    "AND (:reportCode IS NULL OR rm.report_code = :reportCode) " +
                    "AND (:format IS NULL OR rrh.output_format = :format) " +
                    "AND (:status IS NULL OR rrh.status = :status) " +
                    "AND (:requestedFrom IS NULL OR rrh.requested_at >= :requestedFrom) " +
                    "AND (:requestedTo IS NULL OR rrh.requested_at < :requestedTo)",
            nativeQuery = true)
    Page<ReportRequestHistory> findDownloadRequests(@Param("requestedById") String requestedBy,
                                                    @Param("reportCode") String reportCode,
                                                    @Param("format") String format,
                                                    @Param("status") String status,
                                                    @Param("requestedFrom") LocalDateTime requestedFrom,
                                                    @Param("requestedTo") LocalDateTime requestedTo,
                                                  Pageable pageable);
}
