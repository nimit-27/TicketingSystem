package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Tracks SLA metrics for a ticket.
 */
@Entity
@Table(name = "ticket_sla")
@Data
public class TicketSla {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ticket_sla_id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", referencedColumnName = "ticket_id")
    private Ticket ticket;

    @ManyToOne
    @JoinColumn(name = "sla_id", referencedColumnName = "sla_id")
    private SlaConfig slaConfig;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(name = "actual_due_at")
    private LocalDateTime actualDueAt;

    @Column(name = "due_at_after_escalation")
    private LocalDateTime dueAtAfterEscalation;

    @Column(name = "resolution_time_minutes")
    private Long resolutionTimeMinutes;

    @Column(name = "elapsed_time_minutes")
    private Long elapsedTimeMinutes;

    @Column(name = "response_time_minutes")
    private Long responseTimeMinutes;

    @Column(name = "breached_by_minutes")
    private Long breachedByMinutes;

    @Column(name = "idle_time_minutes")
    private Long idleTimeMinutes;

    @Transient
    private LocalDateTime createdAt;

    @Transient
    private Long totalSlaMinutes;

    @Transient
    private Long timeTillDueDate;
}
