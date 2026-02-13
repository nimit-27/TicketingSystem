package com.ticketingSystem.api.models;

import com.ticketingSystem.api.enums.SlaJobRunStatus;
import com.ticketingSystem.api.enums.SlaJobScope;
import com.ticketingSystem.api.enums.SlaJobTriggerType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "sla_calculation_job_run")
@Data
public class SlaCalculationJobRun {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "sla_calculation_job_run_id")
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false, length = 20)
    private SlaJobTriggerType triggerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "run_status", nullable = false, length = 40)
    private SlaJobRunStatus runStatus;

    @Column(name = "triggered_by", length = 120)
    private String triggeredBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", nullable = false, length = 30)
    private SlaJobScope scope;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "total_candidate_tickets")
    private Long totalCandidateTickets;

    @Column(name = "processed_tickets")
    private Long processedTickets;

    @Column(name = "succeeded_tickets")
    private Long succeededTickets;

    @Column(name = "failed_tickets")
    private Long failedTickets;

    @Column(name = "batch_size")
    private Integer batchSize;

    @Column(name = "error_summary", length = 1000)
    private String errorSummary;
}
