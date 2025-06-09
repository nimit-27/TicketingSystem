package com.example.api.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_history")
@Data
public class AssignmentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", referencedColumnName = "id")
    private Ticket ticket;

    @Column(name = "assigned_by")
    private String assignedBy;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}
