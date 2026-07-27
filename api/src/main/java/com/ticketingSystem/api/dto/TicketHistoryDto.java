package com.ticketingSystem.api.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
public class TicketHistoryDto {
    private Long ticketHistoryId;
    private String updateGroupId;
    private String ticketId;
    private String columnName;
    private String updateTypeCode;
    private String displayLabel;
    private String oldRefId;
    private String newRefId;
    private String oldValue;
    private String newValue;
    private String oldText;
    private String newText;
    private String updatedBy;
    private LocalDateTime updatedOn;
    private Instant updatedOnUtc;
    private String remarks;
}
