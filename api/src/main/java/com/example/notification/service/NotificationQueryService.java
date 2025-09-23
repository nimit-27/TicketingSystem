package com.example.notification.service;

import com.example.api.dto.UserNotificationDto;
import com.example.notification.models.Notification;
import com.example.notification.models.NotificationMaster;
import com.example.notification.models.NotificationRecipient;
import com.example.notification.repository.NotificationRecipientRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationQueryService {
    private static final Logger log = LoggerFactory.getLogger(NotificationQueryService.class);

    private final NotificationRecipientRepository notificationRecipientRepository;
    private final ObjectMapper objectMapper;

    public List<UserNotificationDto> getNotificationsForUser(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }

        Page<NotificationRecipient> recipients = notificationRecipientRepository
                .findInbox(userId, false, null, Pageable.unpaged());

        return recipients
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private UserNotificationDto mapToDto(NotificationRecipient recipient) {
        Notification notification = recipient.getNotification();
        NotificationMaster type = notification != null ? notification.getType() : null;

        return new UserNotificationDto(
                recipient.getId(),
                notification != null ? notification.getId() : null,
                type != null ? type.getCode() : null,
                notification != null ? notification.getTitle() : null,
                notification != null ? notification.getMessage() : null,
                parseData(notification != null ? notification.getData() : null),
                notification != null ? notification.getTicketId() : null,
                formatTimestamp(notification != null ? notification.getCreatedAt() : null),
                recipient.isRead()
        );
    }

    private Map<String, Object> parseData(String data) {
        if (data == null || data.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(data, new TypeReference<>() {});
        } catch (Exception ex) {
            log.warn("Failed to parse notification data: {}", data, ex);
            return Collections.emptyMap();
        }
    }

    private String formatTimestamp(LocalDateTime timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.atZone(ZoneId.systemDefault()).toInstant().toString();
    }
}
