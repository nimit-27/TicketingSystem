package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import com.example.notification.enums.ChannelType;
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

    public void sendNotification(ChannelType channel, String templateName, Map<String, Object> dataModel, String recipient) throws Exception {
        if(!properties.isEnabled()) return; //Notification Globally disabled

        Notifier  notifier = notifiers.stream()
                .filter(n -> n.getChannel() == channel)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported channel " + channel));

        String folder = notifier.getTemplateFolder();

        if (folder != null && !folder.isEmpty() && !templateName.startsWith(folder)) {
            templateName = folder + "/" + templateName;
        }

        Map<String, Object> model = dataModel == null ? new HashMap<>() : new HashMap<>(dataModel);
        if (!model.containsKey("supportEmail") && properties.getSupportEmail() != null) {
            model.put("supportEmail", properties.getSupportEmail());
        }

        notifier.send(templateName, model, recipient);
    }
}
