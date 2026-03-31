package com.ticketingSystem.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "integration.nagios")
public class NagiosMonitoringProperties {
    /**
     * Shared secret expected in the X-Nagios-Api-Key header for monitoring calls.
     */
    private String apiKey;

    /**
     * Optional allow-list of client ids permitted to access Nagios monitoring endpoints.
     */
    private List<String> allowedClientIds = List.of();

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public List<String> getAllowedClientIds() {
        return allowedClientIds;
    }

    public void setAllowedClientIds(List<String> allowedClientIds) {
        this.allowedClientIds = allowedClientIds;
    }
}
