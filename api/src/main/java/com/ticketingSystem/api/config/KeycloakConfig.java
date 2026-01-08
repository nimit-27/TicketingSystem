package com.ticketingSystem.api.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.net.MalformedURLException;

@Configuration
@EnableConfigurationProperties(KeycloakProperties.class)
public class KeycloakConfig {

    @Bean
    public KeycloakTokenVerifier keycloakTokenVerifier(KeycloakProperties properties) {
        String issuer = requireText(properties.getIssuer(), "security.keycloak.issuer");
        String audience = requireText(properties.getAudience(), "security.keycloak.audience");
        String jwksUri = resolveJwksUri(properties.getJwksUri(), issuer);

        try {
            return new KeycloakTokenVerifier(
                    issuer,
                    jwksUri,
                    audience
            );
        } catch (MalformedURLException ex) {
            throw new IllegalStateException(
                    "Invalid Keycloak JWKS URI for security.keycloak.jwks-uri (must include http/https): " + jwksUri,
                    ex
            );
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String requireText(String value, String propertyName) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException("Missing required property: " + propertyName);
        }
        return value.trim();
    }

    private String resolveJwksUri(String jwksUri, String issuer) {
        if (StringUtils.hasText(jwksUri)) {
            return requireScheme(jwksUri.trim(), "security.keycloak.jwks-uri");
        }
        String normalizedIssuer = requireScheme(issuer.trim(), "security.keycloak.issuer");
        if (normalizedIssuer.endsWith("/")) {
            normalizedIssuer = normalizedIssuer.substring(0, normalizedIssuer.length() - 1);
        }
        return normalizedIssuer + "/protocol/openid-connect/certs";
    }

    private String requireScheme(String value, String propertyName) {
        if (!value.contains("://")) {
            throw new IllegalStateException(
                    "Property " + propertyName + " must include protocol (http/https): " + value
            );
        }
        return value;
    }
}
