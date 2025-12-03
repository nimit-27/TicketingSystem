package com.ticketingSystem.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "security.cors")
public class CorsProperties {
    private List<String> allowedOrigins = new ArrayList<>();
    private List<String> allowedMethods = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    private List<String> allowedHeaders = List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin", "X-user-ID");
    private List<String> exposedHeaders = List.of(
            "Authorization",
            "X-Access-Token",
            "X-Refresh-Token",
            "X-Access-Token-Expires-In-Minutes",
            "X-Refresh-Token-Expires-In-Minutes"
    );
    private long maxAge = 3600;
    private boolean allowCredentials = true;
}
