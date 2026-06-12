package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "status_history")
@Getter
@Setter
public class StatusHistory {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Kolkata");

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

    @Column(name = "sla_flag")
    private Boolean slaFlag;

    @Column(name = "remark")
    private String remark;

    @PrePersist
    private void prePersist() {
        // Backstop for history writes that do not go through StatusHistoryService.addHistory.
        Instant nowUtc = Instant.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.ofInstant(nowUtc, BUSINESS_ZONE);
        }
        if (timestampUtc == null) {
            timestampUtc = nowUtc;
        }
        if (createdAtUtc == null) {
            createdAtUtc = nowUtc;
        }
    }
}
