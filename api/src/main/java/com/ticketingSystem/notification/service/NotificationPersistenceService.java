package com.ticketingSystem.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.models.GenericUser;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.Notification;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.models.NotificationRecipient;
import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import com.ticketingSystem.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class NotificationPersistenceService {
    private static final Logger log = LoggerFactory.getLogger(NotificationPersistenceService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationRecipientRepository notificationRecipientRepository;
    private final NotificationRecipientResolver recipientResolver;
    private final InAppNotificationPayloadFactory payloadFactory;
    private final ObjectMapper objectMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public InAppNotificationPayload persistInAppNotification(NotificationRequest request) {
        if (request == null) {
            return null;
        }

        InAppNotificationPayload payload = payloadFactory.buildPayload(request);
        return persistNotification(request, payload) ? payload : null;
    }

    private boolean persistNotification(NotificationRequest request, InAppNotificationPayload payload) {
        if (payload == null) {
            return false;
        }

        NotificationMaster master = request.getNotificationMaster();
        if (master == null) {
            log.warn("Unable to persist notification without notification master");
            return false;
        }

        List<GenericUser> recipients = recipientResolver.resolveRecipients(request.getRecipient());
        if (recipients.isEmpty()) {
            log.warn("Unable to resolve recipients for in-app notification: {}", request.getRecipient());
            return false;
        }

        Notification notification = new Notification();
        notification.setType(master);
        notification.setTitle(firstNonBlank(payload.getTitle(), master.getName(), master.getCode(), "Notification"));
        notification.setMessage(payload.getMessage());
        notification.setData(serializeData(payload.getData()));
        notification.setTicketId(resolveTicketId(payload.getData()));

        Notification savedNotification = notificationRepository.saveAndFlush(notification);
        payload.getData().put("notificationId", savedNotification.getId());
        savedNotification.setData(serializeData(payload.getData()));
        Notification persistedNotification = notificationRepository.saveAndFlush(savedNotification);

        List<NotificationRecipient> recipientEntities = recipients.stream()
                .map(user -> createRecipient(persistedNotification, user))
                .toList();

        notificationRecipientRepository.saveAll(recipientEntities);
        return true;
    }

    private NotificationRecipient createRecipient(Notification notification, GenericUser recipient) {
        NotificationRecipient recipientEntity = new NotificationRecipient();
        recipientEntity.setNotification(notification);
        recipientEntity.setGenericRecipient(recipient);
        recipientEntity.setChannel(ChannelType.IN_APP);
        return recipientEntity;
    }

    private String serializeData(Map<String, Object> data) {
        if (data == null || data.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception ex) {
            log.warn("Failed to serialize notification data", ex);
            return null;
        }
    }

    private String resolveTicketId(Map<String, Object> data) {
        if (data == null) {
            return null;
        }
        Object ticketId = data.get("ticketId");
        if (ticketId == null) {
            return null;
        }
        String value = Objects.toString(ticketId, "").trim();
        return value.isEmpty() ? null : value;
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
