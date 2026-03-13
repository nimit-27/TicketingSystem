package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.ClientTokenProperties;
import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.models.ClientCredential;
import com.ticketingSystem.api.models.ClientToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientTokenServiceTest {

    @Mock
    private ClientCredentialService clientCredentialService;

    private ClientTokenProperties tokenProperties;
    private JwtProperties jwtProperties;
    private ClientTokenService service;

    @BeforeEach
    void setUp() {
        tokenProperties = new ClientTokenProperties();
        tokenProperties.setAccessExpirationMinutes(5L);

        jwtProperties = new JwtProperties();
        jwtProperties.setSecret("12345678901234567890123456789012");

        service = new ClientTokenService(clientCredentialService, tokenProperties, jwtProperties);
    }

    @Test
    void issueAccessTokenShouldPersistHashedTokenAndReturnPublicPayload() {
        ClientCredential credential = new ClientCredential();
        credential.setClientId("mobile-app");

        ClientTokenService.IssuedClientToken issued = service.issueAccessToken(credential);

        assertThat(issued.clientId()).isEqualTo("mobile-app");
        assertThat(issued.expiresInMinutes()).isEqualTo(5L);
        assertThat(issued.accessToken()).isNotBlank();

        ArgumentCaptor<String> hashCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<LocalDateTime> expiryCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(clientCredentialService).recordAccessToken(eq(credential), hashCaptor.capture(), expiryCaptor.capture(), eq(null), eq(null));
        // Persisted hash should never equal raw JWT token.
        assertThat(hashCaptor.getValue()).isNotEqualTo(issued.accessToken());
        assertThat(expiryCaptor.getValue()).isAfter(LocalDateTime.now().minusMinutes(1));
    }

    @Test
    void findActiveTokenShouldHashRawTokenBeforeLookup() {
        when(clientCredentialService.findActiveToken(any())).thenReturn(Optional.of(new ClientToken()));

        Optional<ClientToken> result = service.findActiveToken("raw-token");

        assertThat(result).isPresent();
        verify(clientCredentialService).findActiveToken("34d328009b123fbbb0dc93f18b3e6de1ecf7b1a5783c33dff7ffe1926f09e943");
    }

    @Test
    void verifyAccessTokenShouldReturnValidAndExpiredStates() throws InterruptedException {
        ClientCredential credential = new ClientCredential();
        credential.setClientId("c-1");

        String validToken = service.issueAccessToken(credential).accessToken();
        ClientTokenService.TokenVerificationResult validResult = service.verifyAccessToken(validToken);
        assertThat(validResult.valid()).isTrue();
        assertThat(validResult.expired()).isFalse();
        assertThat(validResult.payload().clientId()).isEqualTo("c-1");

        tokenProperties.setAccessExpirationMinutes(0L);
        ClientTokenService shortLivedService = new ClientTokenService(clientCredentialService, tokenProperties, jwtProperties);
        String expiredToken = shortLivedService.issueAccessToken(credential).accessToken();
        Thread.sleep(1100); // ensure token crosses expiration second boundary

        ClientTokenService.TokenVerificationResult expiredResult = shortLivedService.verifyAccessToken(expiredToken);
        assertThat(expiredResult.valid()).isFalse();
        assertThat(expiredResult.expired()).isTrue();
        assertThat(expiredResult.payload()).isNotNull();
    }

    @Test
    void verifyAccessTokenShouldReturnInvalidForMalformedToken() {
        ClientTokenService.TokenVerificationResult result = service.verifyAccessToken("definitely-not-a-jwt");

        assertThat(result.valid()).isFalse();
        assertThat(result.expired()).isFalse();
        assertThat(result.payload()).isNull();
    }

    @Test
    void issueAccessTokenShouldFailWhenSecretMissing() {
        jwtProperties.setSecret(" ");
        ClientTokenService invalidService = new ClientTokenService(clientCredentialService, tokenProperties, jwtProperties);

        assertThrows(IllegalStateException.class,
                () -> invalidService.issueAccessToken(new ClientCredential()));
    }
}
