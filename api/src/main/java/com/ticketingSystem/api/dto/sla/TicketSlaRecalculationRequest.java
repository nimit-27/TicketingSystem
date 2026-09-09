package com.ticketingSystem.api.dto.sla;

import lombok.Data;

import java.util.List;

@Data
public class TicketSlaRecalculationRequest {
    private String ticketId;
    private List<String> ticketIds;

    public List<String> resolvedTicketIds() {
        if (ticketIds != null && !ticketIds.isEmpty()) {
            return ticketIds;
        }
        return ticketId == null ? List.of() : List.of(ticketId);
    }
}
