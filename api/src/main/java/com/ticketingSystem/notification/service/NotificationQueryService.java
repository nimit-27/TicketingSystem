package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.dto.NotificationPageResponse;
import com.ticketingSystem.api.dto.UserNotificationDto;
import com.ticketingSystem.notification.models.Notification;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.models.NotificationRecipient;
import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public NotificationPageResponse getNotificationsForUser(String userId, int page, int size) {
        if (userId == null || userId.isBlank()) {
            return new NotificationPageResponse(List.of(), false, 0, 0, size > 0 ? size : 0);
        }

        int pageNumber = Math.max(page, 0);
        int pageSize = size <= 0 ? 7 : Math.min(size, 50);

        Page<NotificationRecipient> recipients = notificationRecipientRepository
                .findInbox(userId, false, null, PageRequest.of(pageNumber, pageSize));

        List<UserNotificationDto> items = recipients
                .stream()
                .map(this::mapToDto)
                .toList();

        return new NotificationPageResponse(
                items,
                recipients.hasNext(),
                recipients.getTotalElements(),
                recipients.getNumber(),
                recipients.getSize()
        );
    }

    @Transactional
    public int markAllNotificationsAsRead(String userId) {
        if (userId == null || userId.isBlank()) {
            return 0;
        }

        List<NotificationRecipient> unreadRecipients = notificationRecipientRepository
                .findByRecipient_UserIdAndIsReadFalseAndSoftDeletedFalse(userId);

        if (unreadRecipients.isEmpty()) {
            return 0;
        }

        unreadRecipients.forEach(recipient -> recipient.setRead(true));
        notificationRecipientRepository.saveAll(unreadRecipients);
        return unreadRecipients.size();
    }

    private UserNotificationDto mapToDto(NotificationRecipient recipient) {
        Notification notification = recipient.getNotification();
        NotificationMaster type = notification != null ? notification.getType() : null;
        Map<String, Object> data = parseData(notification != null ? notification.getData() : null);
        String remark = extractString(data.get("remark"));
        String ticketId = notification != null ? notification.getTicketId() : null;
        String redirectUrl = extractString(data.get("redirectUrl"));
        if (redirectUrl == null && ticketId != null && !ticketId.isBlank()) {
            redirectUrl = "/tickets/" + ticketId;
        }

        return new UserNotificationDto(
                recipient.getId(),
                notification != null ? notification.getId() : null,
                type != null ? type.getCode() : null,
                notification != null ? notification.getTitle() : null,
                notification != null ? notification.getMessage() : null,
                remark,
                data,
                ticketId,
                redirectUrl,
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

    private String extractString(Object value) {
        if (value == null) {
            return null;
        }
        String text = value.toString().trim();
        return text.isEmpty() ? null : text;
    }
}
