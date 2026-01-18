package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.ExternalSsoTokenResponse;
import com.ticketingSystem.api.models.SsoLoginPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Optional;

@Service
public class ExternalSsoTokenService {
    private static final Logger log = LoggerFactory.getLogger(ExternalSsoTokenService.class);
    private static final String DEFAULT_TOKEN_URL =
            "https://devkeycloak.annadarpan.in/realms/AnnaDarpan/protocol/openid-connect/token";

    private final RestTemplate restTemplate;
    private final String tokenUri;
    private final String clientId;
    private final String clientSecret;

    public ExternalSsoTokenService(
            @Value("${spring.security.oauth2.resourceserver.jwt.token-uri:${security.keycloak.external-token-url:"
                    + DEFAULT_TOKEN_URL + "}}") String tokenUri,
            @Value("${spring.security.oauth2.client.registration.keycloak.client-id:}") String clientId,
            @Value("${spring.security.oauth2.client.registration.keycloak.client-secret:${security.keycloak.secret:}}")
            String clientSecret) {
        this.restTemplate = new RestTemplate();
        this.tokenUri = tokenUri;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public Optional<ExternalSsoTokenResponse> requestToken(SsoLoginPayload payload) {
        String resolvedClientId = clientId == null || clientId.isBlank()
                ? payload.getClientId()
                : clientId;
        if (resolvedClientId == null || resolvedClientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
            log.warn("Missing external SSO client credentials; unable to request token from {}", tokenUri);
            return Optional.empty();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(resolvedClientId, clientSecret);
        MultiValueMap<String, String> requestPayload = new LinkedMultiValueMap<>();
        requestPayload.add("grant_type", "client_credentials");
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestPayload, headers);

        try {
            ResponseEntity<ExternalSsoTokenResponse> response =
                    restTemplate.exchange(tokenUri, HttpMethod.POST, request, ExternalSsoTokenResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return Optional.of(response.getBody());
            }
        } catch (RestClientException ex) {
            log.warn("Failed to fetch external SSO token from {}", tokenUri, ex);
        }
        return Optional.empty();
    }
}
