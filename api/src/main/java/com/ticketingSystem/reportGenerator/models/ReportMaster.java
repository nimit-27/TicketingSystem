package com.ticketingSystem.reportGenerator.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_master")
@Getter
@Setter
public class ReportMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "report_code", nullable = false, unique = true, length = 100)
    private String reportCode;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "data_key", nullable = false, length = 255)
    private String dataKey;

    @Column(name = "source_type", nullable = false, length = 100)
    private String sourceType;

    @Column(name = "source_ref", nullable = false, columnDefinition = "TEXT")
    private String sourceRef;

    @Column(name = "template_location", columnDefinition = "TEXT")
    private String templateLocation;

    @Column(name = "template_type", length = 100)
    private String templateType;

    @Column(name = "default_output_format", nullable = false, length = 50)
    private String defaultOutputFormat;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy = "SYSTEM";

    @Column(name = "updated_at", nullable = false, insertable = false)
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", nullable = false, length = 100)
    private String updatedBy = "SYSTEM";
}
