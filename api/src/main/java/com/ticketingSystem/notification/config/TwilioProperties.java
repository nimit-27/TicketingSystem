package com.ticketingSystem.notification.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "twilio")
public class TwilioProperties {
    private String accountSid;
    private String authToken;
    private String fromNumber;
}
