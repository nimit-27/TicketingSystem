package com.ticketingSystem.api.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketCrHistoryDto {
    private Long historyId;
    private String changeGroupId;
    private String ticketCrId;
    private String ticketId;
    private String columnName;
    private String changeTypeCode;
    private String displayLabel;
    private String oldValue;
    private String newValue;
    private String changedBy;
    private LocalDateTime changedOn;
    private String remarks;
}
