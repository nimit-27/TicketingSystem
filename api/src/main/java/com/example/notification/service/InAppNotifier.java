package com.example.notification.service;

import com.example.notification.enums.ChannelType;
import com.example.notification.models.NotificationMaster;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
public class InAppNotifier implements Notifier{
    private final SimpMessagingTemplate messagingTemplate;

    public InAppNotifier(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
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

        InAppNotificationPayload payload = InAppNotificationPayload.builder()
                .code(master != null ? master.getCode() : null)
                .title(resolveTemplate(master != null ? master.getDefaultTitleTpl() : null, master != null ? master.getName() : null, payloadData))
                .message(resolveTemplate(master != null ? master.getDefaultMessageTpl() : null, master != null ? master.getDescription() : null, payloadData))
                .data(payloadData)
                .timestamp(Instant.now().toString())
                .build();

        messagingTemplate.convertAndSend("/topic/notifications/" + request.getRecipient(), payload);
        System.out.println("In-App notification sent");
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
}
