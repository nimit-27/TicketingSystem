package com.example.notification.service;

import com.example.notification.enums.ChannelType;

import java.util.Map;

public interface Notifier {
    ChannelType getChannel();
    String getTemplateFolder();
    void send(String templateName, Map<String, Object> dataModel, String recipient) throws Exception;
}
