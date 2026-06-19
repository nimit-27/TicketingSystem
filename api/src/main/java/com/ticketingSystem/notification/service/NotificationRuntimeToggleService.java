package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.models.AppRuntimeConfig;
import com.ticketingSystem.api.repository.AppRuntimeConfigRepository;
import com.ticketingSystem.notification.config.NotificationProperties;
import com.ticketingSystem.notification.enums.ChannelType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationRuntimeToggleService {

    private static final String NOTIFICATION_ENABLED_KEY = "notification.enabled";
    // NOTIFICATION_MASTER_CHANGE: Store application-wide channel switches in app_runtime_config.
    private static final String CHANNEL_ENABLED_KEY_PREFIX = "notification.channel.";
    private static final Duration CACHE_TTL = Duration.ofMinutes(2);

    private final AppRuntimeConfigRepository appRuntimeConfigRepository;
    private final NotificationProperties notificationProperties;

    private volatile Boolean cachedEnabled;
    private volatile Instant cacheExpiresAt = Instant.EPOCH;
    // NOTIFICATION_MASTER_CHANGE: Cache each channel independently while retaining the existing master switch.
    private final Map<ChannelType, Boolean> cachedChannels = new EnumMap<>(ChannelType.class);
    private volatile Instant channelCacheExpiresAt = Instant.EPOCH;

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

    // NOTIFICATION_MASTER_CHANGE: Expose effective application-wide channel state to dispatchers and the admin API.
    public synchronized Map<ChannelType, Boolean> getChannelStates() {
        refreshChannelCacheIfRequired();
        return new EnumMap<>(cachedChannels);
    }

    // NOTIFICATION_MASTER_CHANGE: Check both the existing notification master switch and the selected channel switch.
    public boolean isChannelEnabled(ChannelType channel) {
        if (!isNotificationEnabled()) {
            return false;
        }
        refreshChannelCacheIfRequired();
        return cachedChannels.getOrDefault(channel, Boolean.TRUE);
    }

    // NOTIFICATION_MASTER_CHANGE: Persist all channel changes atomically and invalidate the runtime cache immediately.
    public synchronized Map<ChannelType, Boolean> updateChannelStates(Map<ChannelType, Boolean> channelStates) {
        LocalDateTime now = LocalDateTime.now();
        channelStates.forEach((channel, enabled) -> {
            AppRuntimeConfig config = appRuntimeConfigRepository.findById(channelKey(channel))
                    .orElseGet(AppRuntimeConfig::new);
            config.setConfigKey(channelKey(channel));
            config.setConfigValue(Boolean.toString(Boolean.TRUE.equals(enabled)));
            config.setUpdatedAt(now);
            appRuntimeConfigRepository.save(config);
        });
        appRuntimeConfigRepository.flush();
        channelCacheExpiresAt = Instant.EPOCH;
        return getChannelStates();
    }

    // NOTIFICATION_MASTER_CHANGE: Resolve missing channel rows as enabled for backward compatibility.
    private synchronized void refreshChannelCacheIfRequired() {
        Instant now = Instant.now();
        if (!cachedChannels.isEmpty() && now.isBefore(channelCacheExpiresAt)) {
            return;
        }
        for (ChannelType channel : ChannelType.values()) {
            boolean enabled = appRuntimeConfigRepository.findById(channelKey(channel))
                    .map(AppRuntimeConfig::getConfigValue)
                    .map(this::parseBoolean)
                    .orElse(Boolean.TRUE);
            cachedChannels.put(channel, enabled);
        }
        channelCacheExpiresAt = now.plus(CACHE_TTL);
    }

    // NOTIFICATION_MASTER_CHANGE: Keep database keys stable and human-readable.
    private String channelKey(ChannelType channel) {
        return CHANNEL_ENABLED_KEY_PREFIX + channel.name().toLowerCase();
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
