package com.ticketingSystem.notification.service;

import org.springframework.stereotype.Component;

@Component
public class SseInAppNotificationPublisher implements InAppNotificationPublisher {

    private final SseEmitterRegistry emitterRegistry;

    public SseInAppNotificationPublisher(SseEmitterRegistry emitterRegistry) {
        this.emitterRegistry = emitterRegistry;
    }

    @Override
    public void publish(String recipient, InAppNotificationPayload payload) {
        emitterRegistry.sendToRecipient(recipient, payload);
    }
}

