package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_cr")
@Getter
@Setter
public class TicketCr {

    @Id
    @Column(name = "ticket_cr_id", nullable = false, length = 20)
    private String ticketCrId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", referencedColumnName = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", referencedColumnName = "status_id", nullable = false)
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cr_status_id", referencedColumnName = "cr_status_id", nullable = false)
    private CrStatusMaster crStatus;

    @Column(name = "subject")
    private String subject;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "requested_by")
    private String requestedBy;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "assigned_by")
    private String assignedBy;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_on", nullable = false)
    private LocalDateTime updatedOn;

    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdDate = now;
        this.updatedOn = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedOn = LocalDateTime.now();
    }
}
