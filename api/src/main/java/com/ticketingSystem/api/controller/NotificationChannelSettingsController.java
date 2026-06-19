package com.ticketingSystem.api.controller;

import com.ticketingSystem.notification.dto.NotificationChannelSettingsRequest;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.service.NotificationRuntimeToggleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// NOTIFICATION_MASTER_CHANGE: Provide the Notification Master UI with application-wide channel APIs.
@RestController
@RequestMapping("/notification-channel-settings")
@RequiredArgsConstructor
public class NotificationChannelSettingsController {
    private final NotificationRuntimeToggleService notificationRuntimeToggleService;

    @GetMapping
    public ResponseEntity<Map<ChannelType, Boolean>> getSettings() {
        return ResponseEntity.ok(notificationRuntimeToggleService.getChannelStates());
    }

    @PutMapping
    public ResponseEntity<Map<ChannelType, Boolean>> updateSettings(
            @Valid @RequestBody NotificationChannelSettingsRequest request
    ) {
        return ResponseEntity.ok(notificationRuntimeToggleService.updateChannelStates(request.getChannels()));
    }
}
