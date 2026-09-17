package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
public class StatusHistoryDto {
    private String id;
    private String ticketId;
    private String updatedBy;
    private String previousStatus;
    private String currentStatus;
    private String statusName;
    private String label;
    private LocalDateTime timestamp;
    private LocalDateTime originalTimestamp;
    private LocalDateTime updatedTimestamp;
    private Instant timestampUtc;
    private Instant createdAtUtc;
    private Boolean slaFlag;
    private String remark;
}
