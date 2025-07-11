package com.example.notification.service;

import com.example.notification.enums.ChannelType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EmailNotifier implements Notifier {
    @Override
    public ChannelType getChannel() {
        return ChannelType.EMAIL;
    }

    @Override
    public void send(String templateName, Map<String, Object> dataModel, String recipient) throws Exception {
        System.out.println("Email notification sent");
    }
}
