package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import com.example.notification.enums.ChannelType;
import freemarker.template.Configuration;
import freemarker.template.Template;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.StringWriter;
@Component
public class EmailNotifier implements Notifier {
    private final Configuration freemarker;
    private final NotificationProperties properties;
    private final JavaMailSender mailSender;

    public EmailNotifier(@Qualifier("freemarkerConfiguration") Configuration freemarker, NotificationProperties properties, JavaMailSender mailSender) {
        this.freemarker = freemarker;
        this.properties = properties;
        this.mailSender = mailSender;
    }

    @Override
    public ChannelType getChannel() {
        return ChannelType.EMAIL;
    }

    @Override
    public void send(NotificationRequest request) throws Exception {
        Template template = freemarker.getTemplate(request.getTemplateName() + ".ftl");
        StringWriter out = new StringWriter();
        template.process(request.getDataModel(), out);
        String body = out.toString();
        System.out.println("Email notification sent");

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(request.getRecipient());
        helper.setFrom(properties.getSenderEmail());
        helper.setSubject("Notification");
        helper.setText(body, true);
        mailSender.send(message);
    }
}
