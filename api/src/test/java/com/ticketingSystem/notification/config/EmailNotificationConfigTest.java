package com.ticketingSystem.notification.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class EmailNotificationConfigTest {

    @Test
    void createsJavaMailSenderFromLegacySmtpProperties() {
        SmtpMailProperties smtpProperties = new SmtpMailProperties();
        smtpProperties.setHost("smtp.email.ap-mumbai-1.oci.oraclecloud.com");
        smtpProperties.setPort(587);
        smtpProperties.setUserKey("smtp-user-key");
        smtpProperties.setUserid("do_not_reply@example.com");
        smtpProperties.getUser().setPassword("secret");
        Environment environment = new MockEnvironment()
                .withProperty("mail.smtps.auth", "true")
                .withProperty("mail.smtp.starttls.enable", "true")
                .withProperty("mail.smtp.ssl.enable", "false");

        JavaMailSender javaMailSender = new EmailNotificationConfig().smtpJavaMailSender(smtpProperties, environment);

        assertThat(javaMailSender).isInstanceOf(JavaMailSenderImpl.class);
        JavaMailSenderImpl mailSender = (JavaMailSenderImpl) javaMailSender;
        assertThat(mailSender.getHost()).isEqualTo("smtp.email.ap-mumbai-1.oci.oraclecloud.com");
        assertThat(mailSender.getPort()).isEqualTo(587);
        assertThat(mailSender.getUsername()).isEqualTo("smtp-user-key");
        assertThat(mailSender.getPassword()).isEqualTo("secret");
        assertThat(mailSender.getJavaMailProperties())
                .containsEntry("mail.smtp.auth", "true")
                .containsEntry("mail.smtps.auth", "true")
                .containsEntry("mail.smtp.starttls.enable", "true")
                .containsEntry("mail.smtp.ssl.enable", "false");
    }
}
