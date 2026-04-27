package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TicketCrDto {
    private String ticketCrId;
    private String ticketId;
    private String statusId;
    private String statusName;
    private String statusCode;
    private String crStatusId;
    private String crStatusName;
    private String crStatusCode;
    private String subject;
    private String description;
    private String requestedBy;
    private String assignedTo;
    private String assignedBy;
    private String remarks;
    private LocalDateTime createdDate;
    private String createdBy;
    private LocalDateTime updatedOn;
    private String updatedBy;
}
