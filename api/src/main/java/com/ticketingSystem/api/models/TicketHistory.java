package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_history")
@Getter
@Setter
public class TicketHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "change_group_id", nullable = false)
    private String changeGroupId;

    @Column(name = "ticket_id", nullable = false)
    private String ticketId;

    @Column(name = "column_name", nullable = false)
    private String columnName;

    @Column(name = "change_type_code", nullable = false)
    private String changeTypeCode;

    @Column(name = "display_label", nullable = false)
    private String displayLabel;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "changed_by", nullable = false)
    private String changedBy;

    @Column(name = "changed_on", insertable = false, updatable = false)
    private LocalDateTime changedOn;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
}
