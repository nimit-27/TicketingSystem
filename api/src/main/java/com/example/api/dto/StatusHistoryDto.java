package com.example.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class StatusHistoryDto {
    private String id;
    private String ticketId;
    private String updatedBy;
    private String previousStatus;
    private String currentStatus;
    private LocalDateTime timestamp;
    private Boolean slaFlag;
    private String remark;
}
