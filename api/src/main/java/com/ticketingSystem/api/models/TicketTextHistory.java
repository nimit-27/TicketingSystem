package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_text_history")
@Getter
@Setter
public class TicketTextHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "text_history_id")
    private Long textHistoryId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_history_id", nullable = false)
    private TicketHistory ticketHistory;

    @Column(name = "ticket_id", nullable = false)
    private String ticketId;

    @Column(name = "column_name", nullable = false)
    private String columnName;

    @Column(name = "old_text", columnDefinition = "LONGTEXT")
    private String oldText;

    @Column(name = "new_text", columnDefinition = "LONGTEXT")
    private String newText;

    @Column(name = "old_text_hash")
    private String oldTextHash;

    @Column(name = "new_text_hash")
    private String newTextHash;

    @Column(name = "old_text_length")
    private Integer oldTextLength;

    @Column(name = "new_text_length")
    private Integer newTextLength;

    @Column(name = "created_on", insertable = false, updatable = false)
    private LocalDateTime createdOn;
}
