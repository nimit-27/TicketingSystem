package com.ticketingSystem.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "security.jwt")
public class JwtProperties {
    /**
     * Secret key used to sign JWT tokens. It should be at least 32 characters
     * long when using the HS256 algorithm.
     */
    private String secret;

    /**
     * Token expiration time expressed in minutes.
     */
    private long expirationMinutes = 60;

    /**
     * When enabled, the JWT filter is bypassed so the legacy session based
     * behaviour keeps working for local development environments.
     */
    private boolean bypass = true;

    public boolean isBypassEnabled() {
        return bypass;
    }
}
