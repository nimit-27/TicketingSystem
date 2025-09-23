package com.example.api.dto;

import java.util.List;

public record NotificationPageResponse(
        List<UserNotificationDto> items,
        boolean hasMore,
        long total,
        int page,
        int size
) {
}
