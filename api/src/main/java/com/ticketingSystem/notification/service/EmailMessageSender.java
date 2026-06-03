package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.config.NotificationProperties;
import com.ticketingSystem.notification.config.SmtpMailProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.List;

@Component
public class EmailMessageSender {
    private final JavaMailSender mailSender;
    private final NotificationProperties properties;
    private final SmtpMailProperties smtpMailProperties;
    private final EmailAddressValidator emailAddressValidator;
    private final String fromName;

    public EmailMessageSender(JavaMailSender mailSender,
                              NotificationProperties properties,
                              SmtpMailProperties smtpMailProperties,
                              EmailAddressValidator emailAddressValidator,
                              @Value("${from.name:}") String fromName) {
        this.mailSender = mailSender;
        this.properties = properties;
        this.smtpMailProperties = smtpMailProperties;
        this.emailAddressValidator = emailAddressValidator;
        this.fromName = fromName;
    }

    public void send(EmailMessage message) throws MailException, MessagingException, UnsupportedEncodingException {
        String fromAddress = resolveFromAddress();
        validateEmail("from", fromAddress);
        validateEmail("to", message.to());
        message.cc().forEach(email -> validateEmail("cc", email));
        message.bcc().forEach(email -> validateEmail("bcc", email));

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
        if (fromName != null && !fromName.isBlank()) {
            helper.setFrom(fromAddress, fromName);
        } else {
            helper.setFrom(fromAddress);
        }
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

    private String resolveFromAddress() {
        if (smtpMailProperties.getUserid() != null && !smtpMailProperties.getUserid().isBlank()) {
            return smtpMailProperties.getUserid();
        }
        return properties.getSenderEmail();
    }

    private void validateEmail(String fieldName, String email) {
        if (!emailAddressValidator.isValid(email)) {
            throw new IllegalArgumentException("Invalid " + fieldName + " email address: " + email);
        }
    }

    public record EmailMessage(String to, String subject, String body, List<String> cc, List<String> bcc) {
        public EmailMessage {
            cc = cc == null ? List.of() : List.copyOf(cc);
            bcc = bcc == null ? List.of() : List.copyOf(bcc);
        }
    }
}
