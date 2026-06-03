package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.config.NotificationProperties;
import com.ticketingSystem.notification.config.SmtpMailProperties;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailMessageSenderTest {

    private JavaMailSender mailSender;
    private EmailMessageSender sender;

    @BeforeEach
    void setUp() {
        NotificationProperties properties = new NotificationProperties();
        properties.setSenderEmail("sender@example.com");
        SmtpMailProperties smtpMailProperties = new SmtpMailProperties();
        smtpMailProperties.setUserid("sender@example.com");
        mailSender = mock(JavaMailSender.class);
        sender = new EmailMessageSender(mailSender, properties, smtpMailProperties, new EmailAddressValidator(), "FCI - Anna Darpan");
    }

    @Test
    void rejectsInvalidRecipientBeforeCreatingMessage() {
        EmailMessageSender.EmailMessage message = new EmailMessageSender.EmailMessage(
                "invalid recipient",
                "Subject",
                "Body",
                List.of(),
                List.of()
        );

        assertThatThrownBy(() -> sender.send(message))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid to email address");

        verify(mailSender, never()).createMimeMessage();
    }

    @Test
    void sendsMessageWhenAllAddressesAreValid() throws Exception {
        MimeMessage mimeMessage = new JavaMailSenderImpl().createMimeMessage();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        EmailMessageSender.EmailMessage message = new EmailMessageSender.EmailMessage(
                "recipient@example.com",
                "Subject",
                "Body",
                List.of("cc@example.com"),
                List.of("bcc@example.com")
        );

        sender.send(message);

        verify(mailSender).send(mimeMessage);
    }
}
