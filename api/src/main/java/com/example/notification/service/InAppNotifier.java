package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import com.example.notification.enums.ChannelType;
import freemarker.template.Configuration;
import freemarker.template.Template;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.io.StringWriter;
import java.util.Map;

@Component
public class InAppNotifier implements Notifier{
    private final Configuration freemarker;
    private final SimpMessagingTemplate messagingTemplate;

    public InAppNotifier(@Qualifier("freemarkerConfiguration") Configuration freemarker, SimpMessagingTemplate messagingTemplate) {
        this.freemarker = freemarker;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public ChannelType getChannel() {
        return ChannelType.INAPP;
    }

    @Override
    public void send(String templateName, Map<String, Object> dataModel, String recipient) throws Exception {
        Template template = freemarker.getTemplate(templateName);
        StringWriter out = new StringWriter();
        template.process(dataModel, out);

        messagingTemplate.convertAndSend("/topic/notifications/" + recipient, out.toString());
        System.out.println("In-App notification sent");
    }
}
