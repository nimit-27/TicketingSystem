package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.ExternalSsoTokenRequest;
import com.ticketingSystem.api.dto.ExternalSsoTokenResponse;
import com.ticketingSystem.api.models.SsoLoginPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
public class ExternalSsoTokenService {
    private static final Logger log = LoggerFactory.getLogger(ExternalSsoTokenService.class);
    private static final String DEFAULT_TOKEN_URL =
            "https://devkeycloak.annadarpan.in/realms/AnnaDarpan/AnnaDarpan/getAccessToken";

    private final RestTemplate restTemplate;
    private final String tokenUrl;
    private final String clientSecret;

    public ExternalSsoTokenService(
            @Value("${security.keycloak.external-token-url:" + DEFAULT_TOKEN_URL + "}") String tokenUrl,
            @Value("${security.keycloak.secret:}") String clientSecret) {
        this.restTemplate = new RestTemplate();
        this.tokenUrl = tokenUrl;
        this.clientSecret = clientSecret;
    }

    public Optional<ExternalSsoTokenResponse> requestToken(SsoLoginPayload payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ExternalSsoTokenRequest requestPayload = ExternalSsoTokenRequest.builder()
                .username(payload.getUsername())
                .clientId(payload.getClientId())
                .authCode(payload.getAuthCode())
                .secret(clientSecret)
                .build();
        HttpEntity<ExternalSsoTokenRequest> request = new HttpEntity<>(requestPayload, headers);

        try {
            ResponseEntity<ExternalSsoTokenResponse> response =
                    restTemplate.postForEntity(tokenUrl, request, ExternalSsoTokenResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return Optional.of(response.getBody());
            }
        } catch (RestClientException ex) {
            log.warn("Failed to fetch external SSO token from {}", tokenUrl, ex);
        }
        return Optional.empty();
    }
}
