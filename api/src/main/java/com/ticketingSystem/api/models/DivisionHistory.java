package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "division_history")
@Getter
@Setter
public class DivisionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "division_history_id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", referencedColumnName = "ticket_id")
    private Ticket ticket;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "previous_division")
    private String previousDivision;

    @Column(name = "current_division")
    private String currentDivision;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "remark")
    private String remark;
}
