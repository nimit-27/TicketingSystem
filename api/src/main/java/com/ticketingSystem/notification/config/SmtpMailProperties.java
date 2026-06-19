package com.ticketingSystem.notification.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "smtp")
public class SmtpMailProperties {
    private String host;
    private Integer port;
    private String userKey;
    private String userid;
    private final User user = new User();

    @Data
    public static class User {
        private String password;
    }
}
