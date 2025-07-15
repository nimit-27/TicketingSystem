package com.example.notification.service;

import com.example.notification.config.NotificationProperties;
import com.example.notification.enums.ChannelType;
import freemarker.template.Configuration;
import freemarker.template.Template;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.StringWriter;
import java.util.Map;

@Component
public class EmailNotifier implements Notifier {
    private final Configuration freemarker;
    private final NotificationProperties properties;
    private final JavaMailSender mailSender;

    public EmailNotifier(Configuration freemarker, NotificationProperties properties, JavaMailSender mailSender) {
        this.freemarker = freemarker;
        this.properties = properties;
        this.mailSender = mailSender;
    }

    @Override
    public ChannelType getChannel() {
        return ChannelType.EMAIL;
    }

    @Override
    public String getTemplateFolder() {
        return properties.getTemplates().getEmail();
    }

    @Override
    public void send(String templateName, Map<String, Object> data, String recipient) throws Exception {
        Template template = freemarker.getTemplate(templateName + ".ftl");
        StringWriter out = new StringWriter();
        template.process(data, out);
        String body = out.toString();
        System.out.println("Email notification sent");

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(recipient);
        helper.setFrom(properties.getSenderEmail());
        helper.setSubject("Notification");
        helper.setText(body, true);
        mailSender.send(message);
    }
}
