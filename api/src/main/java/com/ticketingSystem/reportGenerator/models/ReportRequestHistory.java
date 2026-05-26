package com.ticketingSystem.reportGenerator.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_request_history")
@Getter
@Setter
public class ReportRequestHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "request_id", length = 36)
    private String requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private ReportMaster report;

    @Column(name = "requested_by", nullable = false, length = 36)
    private String requestedBy;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "output_format", nullable = false, length = 50)
    private String outputFormat;

    @Column(name = "selected_columns_json", columnDefinition = "json")
    private String selectedColumnsJson;

    @Column(name = "filters_json", columnDefinition = "json")
    private String filtersJson;

    @Column(name = "engine_name", length = 255)
    private String engineName;

    @Column(name = "requested_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "failed_at")
    private LocalDateTime failedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
