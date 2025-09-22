package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import com.example.notification.enums.ChannelType;
import com.example.notification.models.NotificationMaster;
import com.example.notification.repository.NotificationMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final List<Notifier> notifiers;
    private final NotificationProperties properties;
    private final NotificationMasterRepository notificationMasterRepository;

    public void sendNotification(ChannelType channel, String notificationCode, Map<String, Object> dataModel, String recipient) throws Exception {
        if(!properties.isEnabled()) return; //Notification Globally disabled

        Notifier  notifier = notifiers.stream()
                .filter(n -> n.getChannel() == channel)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported channel " + channel));

        NotificationMaster notificationMaster = notificationMasterRepository
                .findByCodeAndIsActiveTrue(notificationCode)
                .orElseThrow(() -> new IllegalArgumentException("No active notification found for code " + notificationCode));

        String templateName = resolveTemplateName(notificationMaster, channel);

        Map<String, Object> model = dataModel == null ? new HashMap<>() : new HashMap<>(dataModel);
        if (!model.containsKey("supportEmail") && properties.getSupportEmail() != null) {
            model.put("supportEmail", properties.getSupportEmail());
        }

        notifier.send(templateName, model, recipient);
    }

    private String resolveTemplateName(NotificationMaster notificationMaster, ChannelType channel) {
        String templateName = switch (channel) {
            case EMAIL -> notificationMaster.getEmailTemplate();
            case SMS -> notificationMaster.getSmsTemplate();
            case INAPP -> notificationMaster.getInappTemplate();
        };

        if (templateName == null || templateName.isBlank()) {
            throw new IllegalStateException("No template configured for channel " + channel + " in notification code " + notificationMaster.getCode());
        }

        return templateName;
    }
}
