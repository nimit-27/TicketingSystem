package com.example.api.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_history")
@Data
public class AssignmentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", referencedColumnName = "ticket_id")
    private Ticket ticket;

    @Column(name = "assigned_by")
    private String assignedBy;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "level_id")
    private String levelId;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "remark")
    private String remark;
}
