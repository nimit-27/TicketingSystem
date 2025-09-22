package com.example.notification.service;

import com.example.notification.enums.ChannelType;

public interface Notifier {
    ChannelType getChannel();
    void send(NotificationRequest request) throws Exception;
}
