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
    private final Sse sse = new Sse();

    @Data
    public static class Templates {
        private String email;
        private String sms;
    }

    @Data
    public static class Sse {
        private long defaultTimeoutMillis = 600000L;
        private int maxEmittersPerRecipient = 5;
    }
}
