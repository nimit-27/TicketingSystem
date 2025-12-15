package com.ticketingSystem.api.dto;

import java.util.Map;

public record UserNotificationDto(
        Long id,
        Long notificationId,
        String code,
        String title,
        String message,
        String remark,
        Map<String, Object> data,
        String ticketId,
        String redirectUrl,
        String createdAt,
        boolean read
) { }
