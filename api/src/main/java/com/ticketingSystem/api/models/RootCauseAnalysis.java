package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "root_cause_analysis")
@Getter
@Setter
public class RootCauseAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rca_id")
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", referencedColumnName = "ticket_id", unique = true)
    private Ticket ticket;

    @Column(name = "severity_id")
    private String severityId;

    @Column(name = "description_of_cause", columnDefinition = "TEXT")
    private String descriptionOfCause;

    @Column(name = "resolution_description", columnDefinition = "TEXT")
    private String resolutionDescription;

    @Column(name = "attachment_paths", columnDefinition = "TEXT")
    private String attachmentPaths;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
