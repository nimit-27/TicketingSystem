package com.ticketingSystem.api.dto;

import lombok.Data;

@Data
public class TicketCrUpdateStatusRequestDto {
    private String workflowId;
    private String remarks;
    private String updatedBy;
}
