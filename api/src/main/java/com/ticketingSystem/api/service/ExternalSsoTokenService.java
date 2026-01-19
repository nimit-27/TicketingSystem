package com.ticketingSystem.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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

import javax.management.ObjectName;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ExternalSsoTokenService {
    private static final Logger log = LoggerFactory.getLogger(ExternalSsoTokenService.class);
    private static final String DEFAULT_TOKEN_URL =
            "https://devkeycloak.annadarpan.in/realms/AnnaDarpan/AnnaDarpan/getAccessToken";

    private final RestTemplate restTemplate;
    private final String tokenUrl;
    private final String clientSecret;
    private final ObjectMapper objectMapper;

    public ExternalSsoTokenService(
            @Value("${security.keycloak.external-token-url:" + DEFAULT_TOKEN_URL + "}") String tokenUrl,
            @Value("${security.keycloak.secret:}") String clientSecret, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
        this.tokenUrl = tokenUrl;
        this.clientSecret = clientSecret;
    }

    public Optional<ExternalSsoTokenResponse> requestToken(SsoLoginPayload payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ObjectNode requestPayload = objectMapper.createObjectNode();
        requestPayload.put("username", payload.getUsername());
        requestPayload.put("clientId", payload.getClientId());
        requestPayload.put("authCode", payload.getAuthCode());
        requestPayload.put("secret", clientSecret);
        HttpEntity<ObjectNode> request = new HttpEntity<>(requestPayload, headers);


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
