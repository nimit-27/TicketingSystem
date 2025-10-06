package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.NotificationMaster;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class NotificationRequest {
    private final ChannelType channel;
    private final NotificationMaster notificationMaster;
    private final String recipient;
    private final String templateName;
    private final Map<String, Object> dataModel;

    public NotificationRequest(ChannelType channel,
                               NotificationMaster notificationMaster,
                               String recipient,
                               String templateName,
                               Map<String, Object> dataModel) {
        this.channel = Objects.requireNonNull(channel, "channel must not be null");
        this.notificationMaster = notificationMaster;
        this.recipient = recipient;
        this.templateName = templateName;
        this.dataModel = dataModel == null
                ? Collections.emptyMap()
                : Collections.unmodifiableMap(new HashMap<>(dataModel));
    }

    public ChannelType getChannel() {
        return channel;
    }

    public NotificationMaster getNotificationMaster() {
        return notificationMaster;
    }

    public String getRecipient() {
        return recipient;
    }

    public String getTemplateName() {
        return templateName;
    }

    public Map<String, Object> getDataModel() {
        return dataModel;
    }
}
