package com.ticketingSystem.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.dto.ExternalSsoTokenResponse;
import com.ticketingSystem.api.models.SsoLoginPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ExternalSsoTokenServiceTest {

    private ExternalSsoTokenService service;
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        service = new ExternalSsoTokenService("https://sso.example/token", "shared-secret", new ObjectMapper());
        restTemplate = mock(RestTemplate.class);
        // Replace the internally-created RestTemplate with a mock to unit test network behavior.
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
    }

    @Test
    void requestTokenShouldReturnBodyForSuccessful2xxResponse() {
        ExternalSsoTokenResponse body = new ExternalSsoTokenResponse();
        body.setAccessToken("abc");
        when(restTemplate.postForEntity(eq("https://sso.example/token"), any(HttpEntity.class), eq(ExternalSsoTokenResponse.class)))
                .thenReturn(new ResponseEntity<>(body, HttpStatus.OK));

        Optional<ExternalSsoTokenResponse> result = service.requestToken(payload());

        assertThat(result).contains(body);

        ArgumentCaptor<HttpEntity> requestCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(eq("https://sso.example/token"), requestCaptor.capture(), eq(ExternalSsoTokenResponse.class));
        String serializedBody = requestCaptor.getValue().getBody().toString();
        assertThat(serializedBody).contains("user1", "client-1", "auth-123", "shared-secret");
    }

    @Test
    void requestTokenShouldReturnEmptyForNon2xxResponse() {
        when(restTemplate.postForEntity(eq("https://sso.example/token"), any(HttpEntity.class), eq(ExternalSsoTokenResponse.class)))
                .thenReturn(new ResponseEntity<>(new ExternalSsoTokenResponse(), HttpStatus.BAD_REQUEST));

        assertThat(service.requestToken(payload())).isEmpty();
    }

    @Test
    void requestTokenShouldReturnEmptyWhenRestClientThrows() {
        when(restTemplate.postForEntity(eq("https://sso.example/token"), any(HttpEntity.class), eq(ExternalSsoTokenResponse.class)))
                .thenThrow(new RestClientException("downstream unavailable"));

        assertThat(service.requestToken(payload())).isEmpty();
    }

    private SsoLoginPayload payload() {
        return SsoLoginPayload.builder()
                .username("user1")
                .clientId("client-1")
                .authCode("auth-123")
                .build();
    }
}
