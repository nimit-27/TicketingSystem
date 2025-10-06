package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.config.NotificationProperties;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.repository.NotificationMasterRepository;
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

        Map<String, Object> model = dataModel == null ? new HashMap<>() : new HashMap<>(dataModel);
        if (!model.containsKey("supportEmail") && properties.getSupportEmail() != null) {
            model.put("supportEmail", properties.getSupportEmail());
        }

        String templateName = null;
        if (channel != ChannelType.IN_APP) {
            templateName = resolveTemplateName(notificationMaster, channel);
        }

        NotificationRequest request = new NotificationRequest(
                channel,
                notificationMaster,
                recipient,
                templateName,
                model
        );

        notifier.send(request);
    }

    private String resolveTemplateName(NotificationMaster notificationMaster, ChannelType channel) {
        String templateName = switch (channel) {
            case EMAIL -> notificationMaster.getEmailTemplate();
            case SMS -> notificationMaster.getSmsTemplate();
            case IN_APP -> notificationMaster.getInappTemplate();
        };

        if (templateName == null || templateName.isBlank()) {
            throw new IllegalStateException("No template configured for channel " + channel + " in notification code " + notificationMaster.getCode());
        }

        return templateName;
    }
}
