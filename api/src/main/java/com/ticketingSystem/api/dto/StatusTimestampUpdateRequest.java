package com.ticketingSystem.api.dto;

import java.time.LocalDateTime;

public record StatusTimestampUpdateRequest(LocalDateTime timestamp, Long addMinutes) {
}
