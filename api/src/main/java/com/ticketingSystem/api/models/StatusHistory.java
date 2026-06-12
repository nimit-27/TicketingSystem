package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
@Getter
@Setter
public class StatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "status_history_id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", referencedColumnName = "ticket_id")
    private Ticket ticket;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "previous_status")
    private String previousStatus;

    @Column(name = "current_status")
    private String currentStatus;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "timestamp_utc")
    private Instant timestampUtc;

    @Column(name = "created_at_utc", updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc")
    private Instant updatedAtUtc;

    @Column(name = "sla_flag")
    private Boolean slaFlag;

    @Column(name = "remark")
    private String remark;

    @PrePersist
    @PreUpdate
    private void maintainUtcAuditColumns() {
        // Backstop for history writes that do not go through StatusHistoryService.addHistory.
        Instant now = Instant.now();
        if (createdAtUtc == null) {
            createdAtUtc = now;
        }
        updatedAtUtc = now;
        if (timestamp != null && timestampUtc == null) {
            timestampUtc = now;
        }
    }
}
