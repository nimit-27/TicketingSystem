package com.ticketingSystem.notification.dto;

import com.ticketingSystem.notification.enums.ChannelType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

// NOTIFICATION_MASTER_CHANGE: Validate the application-wide notification channel update payload.
@Getter
@Setter
public class NotificationChannelSettingsRequest {
    @NotEmpty
    private Map<@NotNull ChannelType, @NotNull Boolean> channels;
}
