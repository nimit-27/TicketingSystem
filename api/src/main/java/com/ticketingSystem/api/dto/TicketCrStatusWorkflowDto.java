package com.ticketingSystem.api.dto;

import lombok.Data;

@Data
public class TicketCrStatusWorkflowDto {
    private String crswId;
    private String action;
    private String currentStatusId;
    private String nextStatusId;
}
