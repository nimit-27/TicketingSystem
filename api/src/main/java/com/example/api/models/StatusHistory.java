package com.example.api.models;

import com.example.api.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
@Data
public class StatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", referencedColumnName = "id")
    private Ticket ticket;

    @Column(name = "updated_by")
    private String updatedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private TicketStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status")
    private TicketStatus currentStatus;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}
