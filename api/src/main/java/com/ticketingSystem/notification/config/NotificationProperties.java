package com.ticketingSystem.notification.config;

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
    private final EmailDispatcher emailDispatcher = new EmailDispatcher();
    private final Freemarker freemarker = new Freemarker();

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

    @Data
    public static class EmailDispatcher {
        private int batchSize = 200;
        private int maxRetries = 5;
        private long retryBaseSeconds = 30;
        private long retryMaxSeconds = 3600;
        private long processingTimeoutMinutes = 10;
        private long fixedDelayMs = 5000;
        private long initialDelayMs = 5000;
        private int rateLimitPerSecond = 20;
        private int executorCorePoolSize = 4;
        private int executorMaxPoolSize = 8;
        private int executorQueueCapacity = 500;
        private String instanceId;
    }

    @Data
    public static class Freemarker {
        private long templateUpdateDelayMs = 60000;
        private int cacheStrongSize = 50;
        private int cacheSoftSize = 500;
    }
}
