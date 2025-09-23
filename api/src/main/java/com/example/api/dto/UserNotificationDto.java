package com.example.api.dto;

import java.util.Map;

public record UserNotificationDto(
        Long id,
        Long notificationId,
        String code,
        String title,
        String message,
        Map<String, Object> data,
        String ticketId,
        String createdAt,
        boolean read
) { }
