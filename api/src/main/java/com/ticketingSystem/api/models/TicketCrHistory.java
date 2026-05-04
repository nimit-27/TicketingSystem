package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_cr_history")
@Getter
@Setter
public class TicketCrHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_cr_id", referencedColumnName = "ticket_cr_id", nullable = false)
    private TicketCr ticketCr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_cr_status_id", referencedColumnName = "cr_status_id")
    private CrStatusMaster previousCrStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_cr_status_id", referencedColumnName = "cr_status_id", nullable = false)
    private CrStatusMaster currentCrStatus;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "updated_by", nullable = false)
    private String updatedBy;

    @Column(name = "updated_on", nullable = false)
    private LocalDateTime updatedOn;

    @PrePersist
    protected void onCreate() {
        this.updatedOn = LocalDateTime.now();
    }
}
