package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.config.TwilioProperties;
import com.ticketingSystem.notification.enums.ChannelType;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import freemarker.template.Configuration;
import freemarker.template.Template;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.io.StringWriter;
@Component
public class SmsNotifier implements Notifier {
    private final Configuration freemarker;
    private final TwilioProperties twilioProperties;

    public SmsNotifier(@Qualifier("freemarkerConfiguration") Configuration freemarker, TwilioProperties twilioProperties) {
        this.freemarker = freemarker;
        this.twilioProperties = twilioProperties;
    }

    @Override
    public ChannelType getChannel() {
        return ChannelType.SMS;
    }

    @Override
    public void send(NotificationRequest request) throws Exception {
        Template template = freemarker.getTemplate(request.getTemplateName() + ".ftl");
        StringWriter out = new StringWriter();
        template.process(request.getDataModel(), out);
        String body = out.toString();
        System.out.println("SMS notification sent");

        Message.creator(new PhoneNumber(request.getRecipient()), new PhoneNumber(twilioProperties.getFromNumber()), body).create();
    }
}
