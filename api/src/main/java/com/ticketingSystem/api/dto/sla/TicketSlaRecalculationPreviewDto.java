package com.ticketingSystem.api.dto.sla;

import com.ticketingSystem.api.dto.TicketSlaDto;

public record TicketSlaRecalculationPreviewDto(
        String ticketId,
        TicketSlaDto stored,
        TicketSlaDto calculated,
        int synchronizedHistoryRows,
        boolean updated) {
}
