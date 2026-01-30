package com.ticketingSystem.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.enums.NotificationDeliveryStatus;
import com.ticketingSystem.notification.models.Notification;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.models.NotificationRecipient;
import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import com.ticketingSystem.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EmailNotificationPersistenceService {
    private static final Logger log = LoggerFactory.getLogger(EmailNotificationPersistenceService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationRecipientRepository notificationRecipientRepository;
    private final NotificationRecipientResolver recipientResolver;
    private final ObjectMapper objectMapper;

    public void queueEmailNotification(NotificationRequest request) {
        if (request == null) {
            return;
        }

        NotificationMaster master = request.getNotificationMaster();
        if (master == null) {
            log.warn("Unable to persist email notification without notification master");
            return;
        }

        List<User> recipients = recipientResolver.resolveRecipients(request.getRecipient());
        if (recipients.isEmpty()) {
            log.warn("Unable to resolve recipients for email notification: {}", request.getRecipient());
            return;
        }

        Notification notification = new Notification();
        notification.setType(master);
        notification.setTitle(firstNonBlank(master.getName(), master.getCode(), "Notification"));
        notification.setMessage(null);
        notification.setData(serializeData(request.getDataModel()));
        notification.setTicketId(resolveTicketId(request.getDataModel()));

        Notification savedNotification = notificationRepository.save(notification);

        String cc = extractEmailList(request.getDataModel().get("cc"));
        String bcc = extractEmailList(request.getDataModel().get("bcc"));
        LocalDateTime now = LocalDateTime.now();

        List<NotificationRecipient> recipientEntities = recipients.stream()
                .map(user -> createRecipient(savedNotification, user, cc, bcc, now))
                .toList();

        notificationRecipientRepository.saveAll(recipientEntities);
    }

    private NotificationRecipient createRecipient(Notification notification,
                                                  User recipient,
                                                  String cc,
                                                  String bcc,
                                                  LocalDateTime now) {
        NotificationRecipient recipientEntity = new NotificationRecipient();
        recipientEntity.setNotification(notification);
        recipientEntity.setRecipient(recipient);
        recipientEntity.setChannel(ChannelType.EMAIL);
        recipientEntity.setStatus(NotificationDeliveryStatus.PENDING);
        recipientEntity.setNextRetryAt(now);
        recipientEntity.setEmailCc(cc);
        recipientEntity.setEmailBcc(bcc);
        return recipientEntity;
    }

    private String serializeData(Map<String, Object> data) {
        if (data == null || data.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception ex) {
            log.warn("Failed to serialize email notification data", ex);
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

    private String extractEmailList(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof List<?> list) {
            return list.stream()
                    .map(item -> item == null ? "" : item.toString().trim())
                    .filter(item -> !item.isBlank())
                    .distinct()
                    .reduce((left, right) -> left + "," + right)
                    .orElse(null);
        }
        String text = value.toString().trim();
        return text.isEmpty() ? null : text;
    }
}
