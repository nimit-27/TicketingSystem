package com.ticketingSystem.api.dto;

import java.time.LocalDateTime;

public record TicketFeedbackResponse(
        String ticketId,
        Integer overallSatisfaction,
        Integer resolutionEffectiveness,
        Integer communicationSupport,
        Integer timeliness,
        String comments,
        LocalDateTime submittedAt,
        String submittedBy,
        LocalDateTime dateOfResolution
) {}
