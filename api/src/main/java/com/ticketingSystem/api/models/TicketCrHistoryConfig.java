package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_cr_history_config")
@Getter
@Setter
public class TicketCrHistoryConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_name", nullable = false)
    private String tableName;

    @Column(name = "column_name", nullable = false)
    private String columnName;

    @Column(name = "display_label", nullable = false)
    private String displayLabel;

    @Column(name = "change_type_code", nullable = false)
    private String changeTypeCode;

    @Column(name = "is_trackable", nullable = false)
    private Boolean isTrackable;

    @Column(name = "is_filterable", nullable = false)
    private Boolean isFilterable;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;
}
