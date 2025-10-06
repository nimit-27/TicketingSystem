package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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

    @Column(name = "sla_flag")
    private Boolean slaFlag;

    @Column(name = "remark")
    private String remark;
}
