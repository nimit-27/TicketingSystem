package com.ticketingSystem.api.service;

import com.ticketingSystem.api.enums.RecommendedSeverityStatus;
import com.ticketingSystem.api.enums.TicketStatus;

public record TicketAccessContext(String ticketOwnerId,
                                  String ticketAssigneeUserId,
                                  TicketStatus ticketStatus,
                                  String recommendedSeverityStatus) {

    public static TicketAccessContext basic(String ticketOwnerId, String ticketAssigneeUserId) {
        return new TicketAccessContext(ticketOwnerId, ticketAssigneeUserId, null, null);
    }

    public boolean hasStatus(TicketStatus status) {
        return ticketStatus != null && status != null && ticketStatus == status;
    }

    public boolean hasRecommendedSeverityStatus(RecommendedSeverityStatus status) {
        if (status == null || recommendedSeverityStatus == null) {
            return false;
        }
        return status.name().equalsIgnoreCase(recommendedSeverityStatus);
    }

    public boolean hasPendingRecommendedSeverity() {
        return hasRecommendedSeverityStatus(RecommendedSeverityStatus.PENDING);
    }
}
