package com.ticketingSystem.notification.service;

public interface InAppNotificationPublisher {
    void publish(String recipient, InAppNotificationPayload payload);
}

