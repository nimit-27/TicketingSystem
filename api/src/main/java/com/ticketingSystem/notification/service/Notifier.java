package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.enums.ChannelType;

public interface Notifier {
    ChannelType getChannel();
    void send(NotificationRequest request) throws Exception;
}
