package com.example.notification.service;

public interface InAppNotificationPublisher {
    void publish(String recipient, InAppNotificationPayload payload);
}

