package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.enums.ChannelType;
import org.springframework.stereotype.Component;

@Component
public class EmailNotifier implements Notifier {
    private final EmailNotificationPersistenceService persistenceService;

    public EmailNotifier(EmailNotificationPersistenceService persistenceService) {
        this.persistenceService = persistenceService;
    }

    @Override
    public ChannelType getChannel() {
        return ChannelType.EMAIL;
    }

    @Override
    public void send(NotificationRequest request) {
        persistenceService.queueEmailNotification(request);
    }
}
