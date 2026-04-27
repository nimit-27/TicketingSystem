package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketCrCreateRequestDto {
    private String ticketId;
    private String statusId;
    private String crStatusId;
    private String subject;
    private String description;
    private String requestedBy;
    private String assignedTo;
    private String assignedBy;
    private String remarks;
    private String createdBy;
    private String updatedBy;
}
