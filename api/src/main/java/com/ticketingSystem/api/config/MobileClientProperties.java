package com.ticketingSystem.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mobile.client")
public class MobileClientProperties {
    /**
     * Logical client identifier used by the parent mobile application.
     */
    private String id = "parent-mobile-app";

    /**
     * Secret that the parent mobile application presents when requesting its first
     * token.
     */
    private String secret = "change-me";

    private String description = "Parent mobile application client";

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
