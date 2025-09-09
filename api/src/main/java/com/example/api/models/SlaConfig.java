package com.example.api.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Configuration for SLA timings based on severity.
 */
@Entity
@Table(name = "sla_config")
@Data
public class SlaConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "sla_id")
    private String id;

    @Column(name = "severity_level")
    private String severityLevel;

    @Column(name = "response_minutes")
    private Long responseMinutes;

    @Column(name = "resolution_minutes")
    private Long resolutionMinutes;
}
