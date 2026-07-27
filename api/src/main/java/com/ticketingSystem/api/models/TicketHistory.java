package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_history")
@Getter
@Setter
public class TicketHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_history_id")
    private Long ticketHistoryId;

    @Column(name = "update_group_id", nullable = false)
    private String updateGroupId;

    @Column(name = "ticket_id", nullable = false)
    private String ticketId;

    @Column(name = "column_name", nullable = false)
    private String columnName;

    @Column(name = "update_type_code", nullable = false)
    private String updateTypeCode;

    @Column(name = "display_label", nullable = false)
    private String displayLabel;

    @Column(name = "old_ref_id")
    private String oldRefId;

    @Column(name = "new_ref_id")
    private String newRefId;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "updated_by", nullable = false)
    private String updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @Column(name = "updated_on_utc")
    private Instant updatedOnUtc;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "source_table")
    private String sourceTable;

    @Column(name = "source_history_id")
    private String sourceHistoryId;

    @Column(name = "source_column_name")
    private String sourceColumnName;
}
