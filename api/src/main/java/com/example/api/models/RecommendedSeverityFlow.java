package com.example.api.models;

import com.example.api.enums.RecommendedSeverityStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "recommended_severity_flow")
@Getter
@Setter
public class RecommendedSeverityFlow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recommended_severity_flow_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", referencedColumnName = "ticket_id")
    private Ticket ticket;

    @Column(name = "severity")
    private String severity;

    @Column(name = "recommended_severity")
    private String recommendedSeverity;

    @Column(name = "severity_recommended_by")
    private String severityRecommendedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommended_severity_status")
    private RecommendedSeverityStatus recommendedSeverityStatus;

    @Column(name = "severity_approved_by")
    private String severityApprovedBy;
}
