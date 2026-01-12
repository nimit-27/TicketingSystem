package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.AltchaProperties;
import com.ticketingSystem.api.dto.AltchaVerificationResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AltchaService {
    private final AltchaProperties properties;
    private final RestTemplate restTemplate = new RestTemplate();

    public AltchaService(AltchaProperties properties) {
        this.properties = properties;
    }

    public ResponseEntity<String> fetchChallenge() {
        if (!properties.isEnabled() || !StringUtils.hasText(properties.getChallengeUrl())) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("ALTCHA challenge is not configured");
        }

        try {
            HttpEntity<Void> request = new HttpEntity<>(buildHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    properties.getChallengeUrl(),
                    HttpMethod.GET,
                    request,
                    String.class
            );
            HttpHeaders headers = new HttpHeaders();
            if (response.getHeaders().getContentType() != null) {
                headers.setContentType(response.getHeaders().getContentType());
            } else {
                headers.setContentType(MediaType.APPLICATION_JSON);
            }
            return new ResponseEntity<>(response.getBody(), headers, response.getStatusCode());
        } catch (RestClientException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("ALTCHA challenge fetch failed");
        }
    }

    public boolean verifyToken(String token, String ipAddress) {
        if (!properties.isEnabled()) {
            return true;
        }
        if (!StringUtils.hasText(token) || !StringUtils.hasText(properties.getVerifyUrl())) {
            return false;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("token", token);
        if (StringUtils.hasText(properties.getSecret())) {
            payload.put("secret", properties.getSecret());
        }
        if (StringUtils.hasText(ipAddress)) {
            payload.put("ip", ipAddress);
        }

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, buildHeaders());
            ResponseEntity<AltchaVerificationResponse> response = restTemplate.exchange(
                    properties.getVerifyUrl(),
                    HttpMethod.POST,
                    request,
                    AltchaVerificationResponse.class
            );
            return response.getStatusCode().is2xxSuccessful()
                    && Optional.ofNullable(response.getBody())
                    .map(AltchaVerificationResponse::isSuccess)
                    .orElse(false);
        } catch (RestClientException ex) {
            return false;
        }
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (StringUtils.hasText(properties.getApiKey())) {
            headers.set("X-API-Key", properties.getApiKey());
        }
        return headers;
    }
}
