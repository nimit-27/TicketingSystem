package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MissingTicketCrDto {
    private String ticketId;
    private String subject;
    private String description;
    private String requestedBy;
    private String assignedTo;
    private LocalDateTime reportedDate;
}
