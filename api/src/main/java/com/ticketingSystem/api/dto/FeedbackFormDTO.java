package com.ticketingSystem.api.dto;

import java.time.LocalDateTime;

public record FeedbackFormDTO(
        String ticketId,
        LocalDateTime dateOfResolution
) {}
