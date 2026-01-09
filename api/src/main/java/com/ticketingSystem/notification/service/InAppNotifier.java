package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.enums.ChannelType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class InAppNotifier implements Notifier {

    private final List<InAppNotificationPublisher> publishers;
    private final NotificationPersistenceService persistenceService;

    @Override
    public ChannelType getChannel() {
        return ChannelType.IN_APP;
    }

    @Override
    public void send(NotificationRequest request) {
        InAppNotificationPayload payload = persistenceService.persistInAppNotification(request);
        if (payload == null) {
            return;
        }
        publishers.forEach(publisher -> publisher.publish(request.getRecipient(), payload));
    }
}
