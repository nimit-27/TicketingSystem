package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateStatusTimestampRequest {
    private LocalDateTime timestamp;
    private Long addMinutes;
}
