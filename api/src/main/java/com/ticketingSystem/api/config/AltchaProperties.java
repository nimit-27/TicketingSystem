package com.ticketingSystem.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "security.altcha")
public class AltchaProperties {
    /**
     * Enables server-side verification for ALTCHA challenges.
     */
    private boolean enabled;

    /**
     * URL used to retrieve ALTCHA challenges.
     */
    private String challengeUrl;

    /**
     * URL used to verify ALTCHA tokens.
     */
    private String verifyUrl;

    /**
     * Optional API key sent to ALTCHA endpoints.
     */
    private String apiKey;

    /**
     * Optional secret used for verification when required by the ALTCHA backend.
     */
    private String secret;
}
