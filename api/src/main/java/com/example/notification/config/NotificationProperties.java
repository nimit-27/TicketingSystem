package com.example.notification.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "notification")
@Data
public class NotificationProperties {
    private boolean enabled;
    private String supportEmail;
    private String senderEmail;
    private Templates templates;

    @Data
    public static class Templates {
        private String email;
        private String sms;
    }
}
