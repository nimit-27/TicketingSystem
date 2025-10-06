package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_feedback")
@Getter
@Setter
public class TicketFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long feedbackId;

    @Column(name = "ticket_id", nullable = false)
    private String ticketId;

    @Column(name = "submitted_by")
    private String submittedBy;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "overall_satisfaction", nullable = false)
    private Integer overallSatisfaction;

    @Column(name = "resolution_effectiveness", nullable = false)
    private Integer resolutionEffectiveness;

    @Column(name = "communication_support", nullable = false)
    private Integer communicationSupport;

    @Column(name = "timeliness", nullable = false)
    private Integer timeliness;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
}
