package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import com.example.notification.config.TwilioProperties;
import com.example.notification.enums.ChannelType;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import freemarker.template.Configuration;
import freemarker.template.Template;
import org.springframework.stereotype.Component;

import java.io.StringWriter;
import java.util.Map;

@Component
public class SmsNotifier implements Notifier {
    private final NotificationProperties properties;
    private final Configuration freemarker;
    private final TwilioProperties twilioProperties;

    public SmsNotifier(NotificationProperties properties, Configuration freemarker, TwilioProperties twilioProperties) {
        this.properties = properties;
        this.freemarker = freemarker;
        this.twilioProperties = twilioProperties;
    }

    @Override
    public ChannelType getChannel() {
        return ChannelType.SMS;
    }

    @Override
    public String getTemplateFolder() {
        return properties.getTemplates().getSms();
    }

    @Override
    public void send(String templateName, Map<String, Object> dataModel, String recipient) throws Exception {
        Template template = freemarker.getTemplate(templateName + ".ftl");
        StringWriter out = new StringWriter();
        template.process(dataModel, out);
        String body = out.toString();
        System.out.println("SMS notification sent");

        Message.creator(new PhoneNumber(recipient), new PhoneNumber(twilioProperties.getFromNumber()), body).create();
    }
}
