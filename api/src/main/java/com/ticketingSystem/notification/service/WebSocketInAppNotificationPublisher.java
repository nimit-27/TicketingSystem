package com.ticketingSystem.notification.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class WebSocketInAppNotificationPublisher implements InAppNotificationPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketInAppNotificationPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void publish(String recipient, InAppNotificationPayload payload) {
        messagingTemplate.convertAndSend("/topic/notifications/" + recipient, payload);
    }
}

