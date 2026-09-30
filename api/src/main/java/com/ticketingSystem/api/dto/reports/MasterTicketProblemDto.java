package com.ticketingSystem.api.dto.reports;

import com.ticketingSystem.api.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterTicketProblemDto {
    private String ticketId;
    private TicketStatus status;
    private LocalDateTime reportedDate;
    private long childrenCount;
}
