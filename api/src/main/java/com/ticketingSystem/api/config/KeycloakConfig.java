package com.ticketingSystem.api.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.MalformedURLException;

@Configuration
@EnableConfigurationProperties(KeycloakProperties.class)
public class KeycloakConfig {
    @Bean
    public KeycloakTokenVerifier keycloakTokenVerifier(KeycloakProperties keycloakProperties) throws MalformedURLException {
        return new KeycloakTokenVerifier(keycloakProperties.getIssuer(), keycloakProperties.getJwksUri(), keycloakProperties.getAudience());
    }
}
