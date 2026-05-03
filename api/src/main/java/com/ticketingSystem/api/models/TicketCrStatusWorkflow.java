package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_cr_status_workflow")
@Getter
@Setter
public class TicketCrStatusWorkflow {
    @Id
    @Column(name = "crsf_id", nullable = false, length = 20)
    private String id;

    @Column(name = "action", nullable = false)
    private String action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_status_id", referencedColumnName = "cr_status_id", nullable = false)
    private CrStatusMaster currentStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "next_status_id", referencedColumnName = "cr_status_id", nullable = false)
    private CrStatusMaster nextStatus;

    @Column(name = "created_on", nullable = false)
    private LocalDateTime createdOn;

    @Column(name = "updated_on", nullable = false)
    private LocalDateTime updatedOn;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_by", nullable = false)
    private String updatedBy;

    @Column(name = "active", nullable = false)
    private Boolean active;
}
