package com.ticketingSystem.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.keycloak")
@Getter
@Setter
public class KeycloakProperties {
    private String issuer;
    private String jwksUri;
    private String audience;
}
