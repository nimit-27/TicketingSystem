package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.config.NotificationProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmailMessageSender {
    private final JavaMailSender mailSender;
    private final NotificationProperties properties;

    public EmailMessageSender(JavaMailSender mailSender, NotificationProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    public void send(EmailMessage message) throws MailException, MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
        helper.setFrom(properties.getSenderEmail());
        helper.setTo(message.to());
        if (!message.cc().isEmpty()) {
            helper.setCc(message.cc().toArray(new String[0]));
        }
        if (!message.bcc().isEmpty()) {
            helper.setBcc(message.bcc().toArray(new String[0]));
        }
        helper.setSubject(message.subject());
        helper.setText(message.body(), true);
        mailSender.send(mimeMessage);
    }

    public record EmailMessage(String to, String subject, String body, List<String> cc, List<String> bcc) {
        public EmailMessage {
            cc = cc == null ? List.of() : List.copyOf(cc);
            bcc = bcc == null ? List.of() : List.copyOf(bcc);
        }
    }
}
