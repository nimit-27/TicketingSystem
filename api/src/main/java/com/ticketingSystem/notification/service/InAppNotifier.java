package com.ticketingSystem.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.Notification;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.models.NotificationRecipient;
import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import com.ticketingSystem.notification.repository.NotificationRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class InAppNotifier implements Notifier {

    private final List<InAppNotificationPublisher> publishers;
    private final NotificationRepository notificationRepository;
    private final NotificationRecipientRepository notificationRecipientRepository;
    private final NotificationRecipientResolver recipientResolver;
    private final ObjectMapper objectMapper;

    public InAppNotifier(List<InAppNotificationPublisher> publishers,
                         NotificationRepository notificationRepository,
                         NotificationRecipientRepository notificationRecipientRepository,
                         NotificationRecipientResolver recipientResolver,
                         ObjectMapper objectMapper) {
        this.publishers = publishers;
        this.notificationRepository = notificationRepository;
        this.notificationRecipientRepository = notificationRecipientRepository;
        this.recipientResolver = recipientResolver;
        this.objectMapper = objectMapper;
    }

    @Override
    public ChannelType getChannel() {
        return ChannelType.IN_APP;
    }

    @Override
    public void send(NotificationRequest request) {
        NotificationMaster master = request.getNotificationMaster();
        Map<String, Object> payloadData = request.getDataModel() == null
                ? new HashMap<>()
                : new HashMap<>(request.getDataModel());

        String remark = extractString(payloadData.get("remark"));
        String redirectUrl = resolveRedirectUrl(payloadData);
        if (redirectUrl != null) {
            payloadData.putIfAbsent("redirectUrl", redirectUrl);
        }

        InAppNotificationPayload payload = InAppNotificationPayload.builder()
                .code(master != null ? master.getCode() : null)
                .title(resolveTemplate(master != null ? master.getDefaultTitleTpl() : null,
                        master != null ? master.getName() : null,
                        payloadData))
                .message(resolveTemplate(master != null ? master.getDefaultMessageTpl() : null,
                        master != null ? master.getDescription() : null,
                        payloadData))
                .remark(remark)
                .data(payloadData)
                .redirectUrl(redirectUrl)
                .timestamp(Instant.now().toString())
                .build();

        persistNotification(request, payload, payloadData);
        publishers.forEach(publisher -> publisher.publish(request.getRecipient(), payload));
    }

    private void persistNotification(NotificationRequest request, InAppNotificationPayload payload, Map<String, Object> payloadData) {
        recipientResolver.resolveRecipient(request.getRecipient()).ifPresent(recipient -> {
            Notification notification = new Notification();
            notification.setType(request.getNotificationMaster());
            notification.setTitle(payload.getTitle());
            notification.setMessage(payload.getMessage());
            notification.setTicketId(extractString(payloadData.get("ticketId")));
            notification.setData(serializeData(payloadData));

            Notification savedNotification = notificationRepository.save(notification);

            NotificationRecipient notificationRecipient = new NotificationRecipient();
            notificationRecipient.setNotification(savedNotification);
            notificationRecipient.setRecipient(recipient);
            notificationRecipientRepository.save(notificationRecipient);
        });
    }

    private String serializeData(Map<String, Object> payloadData) {
        try {
            return objectMapper.writeValueAsString(payloadData);
        } catch (Exception ex) {
            return "{}";
        }
    }

    private String resolveTemplate(String template, String fallback, Map<String, Object> data) {
        if (template == null || template.isBlank()) {
            return fallback;
        }
        String resolved = template;
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String value = Objects.toString(entry.getValue(), "");
            resolved = resolved.replace("${" + entry.getKey() + "}", value);
            resolved = resolved.replace("{{" + entry.getKey() + "}}", value);
        }
        return resolved;
    }

    private String extractString(Object value) {
        if (value == null) {
            return null;
        }
        String text = Objects.toString(value, "").trim();
        return text.isEmpty() ? null : text;
    }

    private String resolveRedirectUrl(Map<String, Object> payloadData) {
        String explicitRedirect = extractString(payloadData.get("redirectUrl"));
        if (explicitRedirect != null) {
            return explicitRedirect;
        }

        Object ticketId = payloadData.get("ticketId");
        if (ticketId != null) {
            String ticket = Objects.toString(ticketId, "").trim();
            if (!ticket.isEmpty()) {
                return "/tickets/" + ticket;
            }
        }

        return null;
    }
}

