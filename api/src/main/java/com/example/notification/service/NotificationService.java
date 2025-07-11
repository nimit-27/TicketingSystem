package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import com.example.notification.enums.ChannelType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.module.Configuration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final List<Notifier> notifiers;
    private final NotificationProperties properties;

    public void sendNotification(ChannelType channel, String templateName, Map<String, Object> dataModel, String recipient) throws Exception {
        Notifier  notifier = notifiers.stream()
                .filter(n -> n.getChannel() == channel)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported channel " + channel));

        notifier.send(templateName, dataModel, recipient);
    }
}
