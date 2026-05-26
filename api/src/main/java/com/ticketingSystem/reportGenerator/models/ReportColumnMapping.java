package com.ticketingSystem.reportGenerator.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_column_mapping", uniqueConstraints = {
        @UniqueConstraint(name = "uk_report_column", columnNames = {"report_id", "column_key"})
})
@Getter
@Setter
public class ReportColumnMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "column_id")
    private Long columnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private ReportMaster report;

    @Column(name = "column_key", nullable = false, length = 255)
    private String columnKey;

    @Column(name = "column_label", nullable = false, length = 255)
    private String columnLabel;

    @Column(name = "data_type", nullable = false, length = 100)
    private String dataType;

    @Column(name = "is_default", nullable = false)
    private boolean defaultColumn = true;

    @Column(name = "is_selectable", nullable = false)
    private boolean selectable = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 1;
}
