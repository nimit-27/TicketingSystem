package com.example.api.dto;

import com.example.api.enums.TicketStatus;
import com.example.api.models.Ticket;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class StatusHistoryDto {
    private String id;
    private String ticketId;
    private String updatedBy;
    private TicketStatus previousStatus;
    private TicketStatus currentStatus;
    private LocalDateTime timestamp;
    private Boolean slaFlag;
}
