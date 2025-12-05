package com.ticketingSystem.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.client-tokens")
public class ClientTokenProperties {
    /**
     * Expiration window, in minutes, for client-issued access tokens that protect the
     * mobile application integration endpoints.
     */
    private long accessExpirationMinutes = 60L;

    public long getAccessExpirationMinutes() {
        return accessExpirationMinutes;
    }

    public void setAccessExpirationMinutes(long accessExpirationMinutes) {
        this.accessExpirationMinutes = accessExpirationMinutes;
    }
}
