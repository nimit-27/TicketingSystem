package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.models.AppRuntimeConfig;
import com.ticketingSystem.api.repository.AppRuntimeConfigRepository;
import com.ticketingSystem.notification.config.NotificationProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NotificationRuntimeToggleService {

    private static final String NOTIFICATION_ENABLED_KEY = "notification.enabled";
    private static final Duration CACHE_TTL = Duration.ofMinutes(2);

    private final AppRuntimeConfigRepository appRuntimeConfigRepository;
    private final NotificationProperties notificationProperties;

    private volatile Boolean cachedEnabled;
    private volatile Instant cacheExpiresAt = Instant.EPOCH;

    public boolean isNotificationEnabled() {
        Instant now = Instant.now();
        Boolean cached = cachedEnabled;
        if (cached != null && now.isBefore(cacheExpiresAt)) {
            return cached;
        }

        boolean resolved = appRuntimeConfigRepository.findById(NOTIFICATION_ENABLED_KEY)
                .map(AppRuntimeConfig::getConfigValue)
                .map(this::parseBoolean)
                .orElse(notificationProperties.isEnabled());

        cachedEnabled = resolved;
        cacheExpiresAt = now.plus(CACHE_TTL);
        return resolved;
    }

    private boolean parseBoolean(String value) {
        if (value == null) {
            return notificationProperties.isEnabled();
        }
        return switch (value.trim().toLowerCase()) {
            case "true", "1", "yes", "on" -> true;
            case "false", "0", "no", "off" -> false;
            default -> notificationProperties.isEnabled();
        };
    }
}
