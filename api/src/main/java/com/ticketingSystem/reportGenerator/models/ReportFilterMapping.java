package com.ticketingSystem.reportGenerator.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_filter_mapping", uniqueConstraints = {
        @UniqueConstraint(name = "uk_report_filter", columnNames = {"report_id", "filter_key"})
})
@Getter
@Setter
public class ReportFilterMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "filter_id")
    private Long filterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private ReportMaster report;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 1;

    @Column(name = "filter_key", nullable = false, length = 255)
    private String filterKey;

    @Column(name = "filter_type", nullable = false, length = 100)
    private String filterType;

    @Column(name = "is_required", nullable = false)
    private boolean required;

    @Column(name = "default_value", columnDefinition = "TEXT")
    private String defaultValue;

    @Column(name = "option_source_type", length = 100)
    private String optionSourceType;

    @Column(name = "option_source_ref", columnDefinition = "TEXT")
    private String optionSourceRef;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy = "SYSTEM";

    @Column(name = "updated_at", nullable = false, insertable = false)
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", nullable = false, length = 100)
    private String updatedBy = "SYSTEM";
}
