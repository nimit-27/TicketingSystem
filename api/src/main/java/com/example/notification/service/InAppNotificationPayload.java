package com.example.notification.service;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class InAppNotificationPayload {
    private final String code;
    private final String title;
    private final String message;
    private final Map<String, Object> data;
    private final String timestamp;
}
